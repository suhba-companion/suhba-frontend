# CLAUDE.md — Suhba Backend

REST API for a Vienna-focused Muslim community PWA. Crowd-sourced prayer spots + halal food directory.

---

## Stack

- Java **17**, Spring Boot 3.3.4, Maven
- PostgreSQL 15 (Flyway migrations, `ddl-auto: validate`)
- MapStruct 1.6.2 + Lombok 1.18.34 (Lombok **before** MapStruct in `annotationProcessorPaths`)
- SpringDoc OpenAPI 2.5.0
- H2 in-memory for tests (`@ActiveProfiles("test")`)

---

## Package layout

```
com.suhba/
├── SuhbaApplication.java
├── configuration/SpringDocConfiguration.java
├── controller/rest/PrayerSpotController.java, HalalSpotController.java
├── exception/BLException.java, DALException.java, GlobalExceptionHandler.java
├── services/
│   ├── PrayerSpotService.java, HalalSpotService.java   ← interfaces
│   ├── impl/PrayerSpotServiceImpl.java, HalalSpotServiceImpl.java
│   ├── dto/PrayerSpotDto.java, HalalSpotDto.java, NearbyQueryDto.java
│   └── mapper/PrayerSpotMapper.java, HalalSpotMapper.java
└── persistence/
    ├── entities/PrayerSpotEntity.java, HalalSpotEntity.java
    └── repositories/PrayerSpotRepository.java, HalalSpotRepository.java
```

---

## Key rules

1. `jakarta.*` everywhere — never `javax.*`
2. Entities never leave the service layer — controllers use DTOs only
3. `distanceKm` is computed in service (haversine), never stored in DB
4. New spots always start `PENDING`; service sets `status`, `upvotes`, `featured` — never the caller
5. Flyway manages schema — never use `ddl-auto: create/update`
6. `/approve` and `/reject` endpoints are unprotected — TODO add `@PreAuthorize("hasRole('ADMIN')")` when Spring Security is added
7. `haversine()` and `boundingBox()` are private methods in each ServiceImpl — no shared util class

---

## Data model

**prayer_spots**: `id, name, description, address, district, latitude, longitude, type (MOSQUE/MUSALLA/PUBLIC/OFFICE/OTHER), wudu_available, sistan_available, friday_prayer, status (PENDING/APPROVED/REJECTED), submitted_by, created_at, updated_at, upvotes`

**halal_spots**: same base fields + `category (RESTAURANT/GROCERY/BUTCHER/CAFE/BAKERY/OTHER), phone, website, certified, certification_body, featured` + child table `halal_spot_cuisines(spot_id, cuisine)`

`cuisines` on `HalalSpotEntity` uses `FetchType.EAGER` to avoid `LazyInitializationException` outside transaction.

---

## API endpoints

Both resources follow the same pattern under `/api/v1/{prayer-spots,halal-spots}`:

- `GET /nearby?latitude=&longitude=&radiusKm=` — `@ModelAttribute`, not `@RequestBody`
- `GET /pending` — admin queue
- `GET /{id}`
- `POST /` — `X-User-Id` header → `submittedBy`
- `POST /{id}/upvote`
- `PATCH /{id}/approve`
- `PATCH /{id}/reject`

Halal spots also have `GET /featured`.

`findNearby` sorts by `distanceKm` asc; featured halal spots bubble up within same distance band.

---

## Local dev

```bash
# Start DB only
docker compose up -d db

# Run app
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

Credentials: `suhba / suhba`, DB `suhba` on port 5432.

---

## Out of scope (not yet implemented)

- Spring Security / auth
- Prayer times feature
- Events / activities
- Rate limiting on upvote
