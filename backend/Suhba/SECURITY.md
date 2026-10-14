# Backend security review (2026-10-14)

Review of the Spring Boot API: database access, authentication, the anonymous write
endpoints, and what the public internet can reach. Six issues were found and fixed. This
document is the record of what was wrong, why it mattered, and what changed.

## Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Login rate limiter bypassable via a spoofed header | Critical | Fixed |
| 2 | Anonymous writes had no throttle and no size cap | High | Fixed |
| 3 | Upvotes were unauthenticated and unlimited | Medium | Fixed |
| 4 | Swagger published the admin API map in production | Low | Fixed |
| 5 | Rate limit state is per-instance | Low | Accepted, documented |
| 6 | `website` was rendered as a link without validation | Medium | Fixed |

Nothing was found in the areas that usually matter most: there is no SQL injection surface
(see "What was already correct" below).

---

## 1. Login rate limiter bypassable via a spoofed header

**Severity:** Critical

**What was wrong.** `AdminController.clientIp()` identified the caller by the *leftmost*
entry of the `X-Forwarded-For` header. That entry is supplied by whoever made the request.
Render appends the address it actually received the connection from to the *end* of the
header, so the leftmost value is attacker-controlled.

The effect: send a different fake `X-Forwarded-For` on every request and each attempt looks
like a brand new IP. The 5-attempt / 15-minute lockout never triggers, leaving
`POST /api/admin/login` open to unlimited brute force against a single admin account. The
same trick also let an attacker inflate the in-memory attempts map at will.

There was a second, quieter half to this bug. In production `forward-headers-strategy:
framework` is on, and Spring's `ForwardedHeaderFilter` *removes* `X-Forwarded-For` from the
request before controllers see it. So in production the header lookup returned null and the
code fell through to `getRemoteAddr()`, which that same filter had already populated from
the leftmost entry. Both paths led to the same spoofable value.

**The fix.** New `ClientIpFilter` resolves the client IP once per request and takes the
**rightmost** hop, which is the only one our own proxy wrote. `AdminController` now calls
`ClientIpFilter.resolve(request)`.

Because the resolution has to happen before `ForwardedHeaderFilter` strips the header, and
Spring Boot registers that filter at `HIGHEST_PRECEDENCE` (which would tie with ours and
leave the order undefined), `WebMvcConfiguration` now re-registers `ForwardedHeaderFilter`
explicitly at `HIGHEST_PRECEDENCE + 10`. Boot backs off automatically when it sees our bean.
The behaviour is otherwise identical, and the property condition mirrors Boot's own so local
dev is unaffected.

**Caveat worth knowing.** "Rightmost hop" is correct because exactly one proxy (Render's
edge) sits in front of the app and the container is not reachable any other way. If a second
proxy is ever added in front, or the container becomes directly reachable, this needs to be
revisited.

**Files:** `configuration/ClientIpFilter.java` (new),
`configuration/WebMvcConfiguration.java`, `controller/rest/AdminController.java`

---

## 2. Anonymous writes had no throttle and no size cap

**Severity:** High

**What was wrong.** `POST /api/v1/{events,prayer-spots,halal-spots}` and the upvote routes
are anonymous by design: no account, no API key, no limit on how often they can be called.
On top of that, no DTO field had a length cap, and `events.description` is a Postgres `TEXT`
column, so a single request could carry an arbitrarily large body. Spring does not cap JSON
request bodies by default.

The effect: a trivial script could fill the database, and because the Hikari pool is
deliberately capped at 3 connections (the production pooler allows 15 clients total), a
burst of writes could starve the pool and take the API down for everyone. This is a cheap
outage, not just a storage bill.

**The fix.** Two layers.

*HTTP layer:* `PublicWriteGuardFilter` runs on every mutating request under `/api/v1/*`:

- Requests with a `Content-Length` over 64 KB get `413 Payload Too Large` before Jackson
  parses anything into memory.
- Each client IP gets 30 writes per 5 minutes; past that, `429`.
- `GET`, `HEAD` and `OPTIONS` are never touched, so reads and CORS preflights are unaffected.

The filter is ordered behind Spring Security's chain on purpose, so rejections still carry
CORS headers. Otherwise the browser would report an opaque network error instead of the
actual status code.

*Validation layer:* every free-text field on `EventDto`, `PrayerSpotDto` and `HalalSpotDto`
now has a `@Size` cap, chosen to sit at or under the real column width so a valid request can
never fail at the database. `HalalSpotDto.cuisines` is capped at 20 entries of 100 chars, so
one submission cannot write thousands of child rows.

**Files:** `configuration/PublicWriteGuardFilter.java` (new),
`configuration/PublicWriteRateLimitService.java` (new), `configuration/SecurityConfig.java`,
all three DTOs

---

## 3. Upvotes were unauthenticated and unlimited

**Severity:** Medium

**What was wrong.** `upvote(id)` incremented a counter with no caller identity and no
idempotency. A loop could set any spot's score to any value. `HalalSpotRepository`
orders results by `featured DESC, upvotes DESC`, so upvotes drive the position of every
business in the directory, and directory placement is something Suhba intends to sell.

Paid "featured" placement was never at risk, since `featured` sorts first. The exposure was
ranking manipulation within the non-featured band, plus one database write per request.

**The fix.** `PublicWriteGuardFilter` recognises the upvote path and enforces one upvote per
IP per target per 24 hours; repeats get `429 Already upvoted`. The service layer is
unchanged, which keeps the guard in one place rather than spread across three services.

**Files:** `configuration/PublicWriteGuardFilter.java`,
`configuration/PublicWriteRateLimitService.java`

---

## 4. Swagger published the admin API map in production

**Severity:** Low

**What was wrong.** `SecurityConfig` permits `/swagger-ui/**` and `/v3/api-docs/**` to
everyone, in every environment. In production that hands any visitor a complete, structured
map of the API including the admin routes and the login endpoint. Not a vulnerability on its
own, but free reconnaissance for anyone looking for one.

**The fix.** `application-prod.yml` disables springdoc entirely
(`springdoc.api-docs.enabled: false`, `springdoc.swagger-ui.enabled: false`). The endpoints
no longer exist in production, so the `permitAll` rule has nothing to expose. Swagger still
works in local dev, where it is useful.

**Files:** `resources/application-prod.yml`

---

## 5. Rate limit state is per-instance

**Severity:** Low. **Accepted, not fixed.**

Both `LoginRateLimitService` and the new `PublicWriteRateLimitService` keep their counters in
a `ConcurrentHashMap` in the application's memory. Two consequences:

- The counters reset on every deploy and restart.
- With more than one container, each instance enforces its own limits independently, so the
  effective limit multiplies by the number of instances.

This is fine for a single Render container, which is the current deployment. Fixing it
properly means a shared store (Redis) or a database table, which is a new dependency and a
new piece of infrastructure to run. Not worth it at this size. The constraint is recorded in
`CLAUDE.md` so it is not forgotten the day the app scales out.

---

## 6. `website` was rendered as a link without validation

**Severity:** Medium

**What was wrong.** `HalalSpotDto.website` accepted any string from an anonymous public
submission, and `HalalBusinessDetailPage.tsx` renders it directly as an `href`. A submitted
value of `javascript:...` becomes an executable link on the detail page once an admin
approves the business, and nothing in the approval queue makes a bad scheme obvious. That is
stored XSS with a human in the loop.

`EventDto.registrationUrl` already had an `^https?://` pattern. `googleMapsUrl` had none on
any of the three DTOs; it is not rendered anywhere today, so that one was latent rather than
live.

**The fix.** `website` and `googleMapsUrl` now carry
`@Pattern(regexp = "^(https?://.*)?$")` plus a `@Size` cap. The pattern deliberately allows
null and empty so existing rows and admin edits that omit the field still validate, while
any non-http(s) scheme is rejected at the boundary.

**Files:** `services/dto/HalalSpotDto.java`, `services/dto/EventDto.java`,
`services/dto/PrayerSpotDto.java`

---

## What was already correct

Worth recording, so nobody re-litigates it later:

- **No SQL injection surface.** Every database access goes through Spring Data JPA. The five
  custom `@Query` methods are JPQL with `:named` parameters bound via `@Param`. There is no
  `JdbcTemplate`, no `Statement`, no `createNativeQuery`, no `nativeQuery = true`, and no
  string concatenation anywhere near a query. Hibernate compiles all of it to
  `PreparedStatement` with bound parameters.
- **Mass assignment is blocked.** `submit()` overwrites `status` to `PENDING`, `upvotes` to
  `0`, `verified`/`featured` to `false`, so a caller cannot self-approve or self-promote.
- **Every admin route carries `@PreAuthorize("hasRole('ADMIN')")`**, including the `/pending`
  queues on the public controllers.
- **CSRF** is correctly configured for the cross-site admin panel, including the
  `SameSite=None; Secure` cookie attributes and the non-XOR token handler.
- **Passwords** use BCrypt at strength 12. Sessions are rotated on login (session fixation).
- **Actuator** exposes only `health`.
- **No secrets in the repository** outside the local dev profile.

## Verification

`mvn test` with Java 17: 111 tests, all passing. New coverage:

- `ClientIpFilterTest`: the resolved address comes from the proxy's hop, and rotating the
  caller-supplied entries does not change it.
- `PublicWriteRateLimitServiceTest`: burst limit, per-address scoping, upvote dedupe.
- `PublicWriteGuardFilterTest`: reads pass through untouched, oversized bodies get 413,
  write bursts get 429, the same target cannot be upvoted twice.

## Follow-ups not done here

- Move rate limit state to a shared store before running more than one instance (issue 5).
- Consider durable upvote dedupe (a table keyed by target plus voter) if upvotes ever gate
  anything commercial.
- The frontend still renders `website` as an href without its own sanitisation. The backend
  now guarantees the scheme, so this is defence in depth rather than a gap.
