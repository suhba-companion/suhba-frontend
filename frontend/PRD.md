# PRD — Suhba (صُحبة)

**Version:** 1.0 — MVP
**Status:** Active Development
**Platform:** PWA (Progressive Web App) — mobile-first
**Stack:** React + TypeScript + Tailwind CSS + Vite

---

## 1. What Is Suhba?

Suhba (صُحبة — Arabic for "companionship/good company") is a Vienna-focused Muslim community utility PWA. It serves as the go-to digital companion for Muslim residents and tourists in Vienna — helping them find halal food, prayer spots, mosque information, community events, and prayer times, all in one place.

**Tagline:** Your Muslim companion in Vienna.

---

## 2. Target Users

| User | Description |
|------|-------------|
| Muslim Viennese resident | Lives in Vienna, uses the app regularly to find halal spots, track prayer times, and stay connected to community events |
| Muslim tourist | Visiting Vienna, needs quick answers: where to pray, where to eat halal, what's happening |
| Business owner | Halal restaurant, Islamic bookshop, Muslim service provider wanting visibility in the directory |

---

## 3. Core Problem

Muslim residents and tourists in Vienna have no single, reliable, community-focused digital resource. Information is scattered across outdated websites, Facebook groups, and word of mouth. Suhba consolidates everything into one beautiful, fast, trustworthy app.

---

## 4. Five Core Features (MVP Scope)

### Feature 1 — Prayer Times

**User Story:** As a Muslim in Vienna, I want to see today's accurate prayer times so I can plan my day around salah.

**Requirements:**
- Display 5 daily prayer times: Fajr, Dhuhr, Asr, Maghrib, Isha (+ Sunrise)
- Calculation method selector: ISNA, MWL, Diyanet (default: MWL — most common in Europe)
- Hijri date displayed alongside Gregorian
- Countdown to next prayer (live, updating)
- Optional: push notification reminder (PWA notification API)
- Location-aware (Vienna hardcoded as default, optional GPS override)

**Out of scope for MVP:** Qibla compass, custom Adhan audio

---

### Feature 2 — Halal Food & Business Directory

**User Story:** As a Muslim in Vienna, I want to find halal-certified restaurants and Muslim-owned businesses near me.

**Requirements:**
- Listings: restaurant name, cuisine type, address, opening hours, halal certification status, phone, website link
- Filter by: distance, cuisine type, certification status (certified / Muslim-owned / alcohol-free)
- Search by name or neighbourhood
- Map view (Google Maps embed or Leaflet.js)
- List view with card layout
- Each listing has a detail page
- "Suggest a business" CTA (form that sends to admin)

**Monetization:** Featured listings appear at the top with a gold badge — paid by the business owner.

**Out of scope for MVP:** Reviews, ratings, user-generated content

---

### Feature 3 — Prayer Spot Finder

**User Story:** As a Muslim tourist or commuter, I want to find the nearest place to pray when I'm out in the city.

**Requirements:**
- Shows prayer-friendly locations: mosques, musallas, Islamic centres, and community-reported spots
- Map-first view (user's location → nearest spots)
- Each spot has: name, type (mosque / musalla / room), address, capacity, wudu availability (yes/no/unknown), opening hours
- Distance shown from user's current location
- "Add a spot" CTA for community submissions

**Difference from Mosques feature:** Prayer spots includes informal locations (shopping centre prayer rooms, university musallas, etc.) — mosques get their own dedicated section.

**Out of scope for MVP:** Indoor navigation, live occupancy

---

### Feature 4 — Vienna Mosques Directory

**User Story:** As a Muslim in Vienna, I want a clear directory of all mosques with their details and programmes.

**Requirements:**
- Full list of Vienna mosques with: name, denomination/madhab affiliation, address, phone, prayer times (Jumu'ah time especially), languages spoken, programmes offered (Quran classes, youth group, etc.)
- Filter by: district (Bezirk), language, denomination
- Map view + list view
- Each mosque has a detail page
- Jumu'ah time prominently displayed on cards

**Out of scope for MVP:** Live updates from mosques, push notifications for events

---

### Feature 5 — Community Activities & Events

**User Story:** As a Muslim in Vienna, I want to know what Islamic events and activities are happening this week.

**Requirements:**
- Event cards: title, date/time, location, organiser, category (lecture, iftar, fundraiser, class, social)
- Filter by: category, date range, district
- Calendar view + list view
- Each event has a detail page with description and location map
- "Submit an event" CTA
- Events marked as free / paid

**Monetization:** Featured/promoted events — paid by organiser.

**Out of scope for MVP:** In-app ticket purchase, RSVP system

---

## 5. Out of Scope (Entire MVP)

- User accounts / login
- Reviews or ratings
- In-app payments
- Chat or messaging
- Content in languages other than German, English, Arabic (Phase 2)
- iOS/Android native apps (PWA only for now)
- Admin dashboard (manage via simple backend or Airtable for now)

---

## 6. Design System

### Visual Identity

| Token | Value |
|-------|-------|
| Primary colour | Dark green `#1B4332` (Islamic heritage) |
| Accent colour | Gold `#C9A84C` |
| Background (light) | Off-white `#FAF8F4` |
| Background (dark) | Deep charcoal `#0F1A14` |
| Text | Near-black `#1A1A1A` |
| Error | Muted red `#C0392B` |
| Success | Muted green `#27AE60` |

### Typography

- **Display / headings:** Serif or Arabic-inspired typeface — elegant, not decorative
- **Body:** Clean, highly legible sans-serif
- **Arabic text:** Always use a proper Arabic web font (e.g. Noto Naskh Arabic, Amiri) — never fallback to system Arabic

### Logo

- Arabic letters of "صُحبة" stylized into a botanical / plant mark
- Represents growth, community, and Islamic geometric beauty
- Works in dark green on light and gold on dark

### Component Style Rules

- Cards: soft rounded corners (`rounded-2xl`), subtle shadow, no hard borders
- Bottom navigation bar (mobile-first): 5 icons for 5 features
- No cluttered UI — generous whitespace
- Islamic geometric pattern as subtle background texture on key screens (hero, splash)
- Gold used sparingly — CTAs, badges, featured items, highlights only
- Dark mode support from day one

### Iconography

- Custom or carefully selected icon set — consistent line weight
- Prayer mat icon for prayer times
- Crescent for Islamic identity elements
- Map pin variants for different location types

---

## 7. Navigation Structure

```
Bottom Nav (always visible on mobile):
├── 🕌  Mosques
├── 🍽️  Halal Food
├── 🧭  Prayer Spots
├── 🗓️  Events
└── 🕐  Prayer Times

Each tab:
├── List / Map / Calendar view (where applicable)
├── Filter bar
├── Detail page (full screen, back arrow)
└── Submit / Suggest CTA
```

---

## 8. Screen Inventory (MVP)

| Screen | Route | Notes |
|--------|-------|-------|
| Splash / Onboarding | `/` | App intro, language select, location permission |
| Prayer Times | `/prayer-times` | Live countdown, today's times, Hijri date |
| Halal Directory — List | `/halal` | Cards, filters, search |
| Halal Directory — Map | `/halal/map` | Map pins, tap to see card |
| Halal Detail | `/halal/:id` | Full listing info |
| Prayer Spots — Map | `/prayer-spots` | Map-first, nearest spots |
| Prayer Spot Detail | `/prayer-spots/:id` | Spot details |
| Mosques — List | `/mosques` | Filterable list |
| Mosque Detail | `/mosques/:id` | Full mosque info, Jumu'ah time, programmes |
| Events — List | `/events` | Calendar + list toggle |
| Event Detail | `/events/:id` | Full event info |
| Submit Form | `/submit` | Universal "suggest/submit" form |
| 404 | `*` | Friendly Arabic/German/English message |

---

## 9. Data Model (Frontend Types)

```ts
interface PrayerTimes {
  date: string;          // Gregorian
  hijriDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  method: 'MWL' | 'ISNA' | 'Diyanet';
}

interface HalalBusiness {
  id: string;
  name: string;
  category: 'restaurant' | 'grocery' | 'bakery' | 'service' | 'other';
  cuisineType?: string;
  address: string;
  district: string;          // Vienna Bezirk (1–23)
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  openingHours: string;
  halalStatus: 'certified' | 'muslim-owned' | 'alcohol-free';
  featured: boolean;         // paid featured listing
  image?: string;
}

interface PrayerSpot {
  id: string;
  name: string;
  type: 'mosque' | 'musalla' | 'prayer-room' | 'community-reported';
  address: string;
  lat: number;
  lng: number;
  wuduAvailable: boolean | null;
  capacity?: number;
  openingHours?: string;
  notes?: string;
}

interface Mosque {
  id: string;
  name: string;
  denomination?: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  jumuahTime: string;
  languages: string[];
  programmes: string[];
  image?: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: 'lecture' | 'iftar' | 'fundraiser' | 'class' | 'social' | 'other';
  date: string;
  time: string;
  location: string;
  district: string;
  organiser: string;
  isFree: boolean;
  featured: boolean;         // paid promoted event
  image?: string;
}
```

---

## 10. API & Data Sources

### Primary APIs

#### 1. Aladhan API — Prayer Times

- **URL:** `https://api.aladhan.com/v1/timingsByCity`
- **Auth:** None required — completely free
- **Used for:** Calculated prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha, Sunrise) + Hijri date
- **Key endpoint:**
  ```
  GET https://api.aladhan.com/v1/timingsByCity?city=Vienna&country=Austria&method=3
  ```
- **Methods:** `3` = MWL (Muslim World League) — recommended default for Europe
- **Caching:** Cache per day — times only change daily, don't re-fetch on every render

---

#### 2. MasjidiApp API — Mosques & Iqamah Times

- **Base URL:** `https://api.masjidiapp.com`
- **Auth:** `Authorization: 123-test-key` (test env — works for development)
- **Production key:** Request via WhatsApp +1 530 508 6624 before launch
- **Used for:** Mosque directory, mosque details, Iqamah times, mosque search by location
- **Key endpoints:**
  ```
  GET /masjid?lat=48.2082&lng=16.3738&radius=10   # Mosques near Vienna
  GET /masjid/{masjidId}                           # Mosque detail
  GET /masjid/{masjidId}/iqamah                    # Iqamah times
  GET /masjid/{masjidId}/salah                     # Prayer times for mosque
  ```

---

#### 3. OpenStreetMap + Leaflet.js — Maps

- **Auth:** None — completely free
- **Package:** `leaflet` + `react-leaflet`
- **Tile server:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Rule:** Always lazy-load map components — they are heavy and must not block initial render

---

### Custom Data (Supabase — managed by Suhba)

| Data | Notes |
|------|-------|
| Halal food & business directory | Manual curation — no public API exists for halal listings |
| Prayer spots (informal locations) | Community submissions + manual review |
| Community events | Community submissions + manual review |
| Featured listings metadata | Paid featured flag, business contact info |

---

### Service Layer Structure

```
src/services/
  aladhanService.ts      # Prayer times + Hijri date
  masjidiService.ts      # Mosque directory + iqamah times
  supabaseClient.ts      # Supabase client init
  halalService.ts        # Halal business directory
  eventsService.ts       # Community events
  prayerSpotsService.ts  # Prayer spots
```

### Environment Variables

```env
VITE_MASJIDI_API_KEY=123-test-key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never hardcode API keys in components — always use `import.meta.env.VITE_*`

---

## 11. Monetization (Phase 1)

| Revenue Stream | Implementation |
|----------------|----------------|
| Featured business listings | Gold badge, top of search results — monthly fee |
| Promoted events | "Sponsored" label, top of events feed — per event fee |
| Phase 2: Directory advertising | Banner placement for halal-relevant brands |

---

## 12. Multilingual Support

- **Phase 1 (MVP):** English + German
- **Phase 2:** Arabic (RTL layout support required — plan for this in CSS from day one)
- Use `i18next` for all user-facing strings — no hardcoded English text anywhere in components
- RTL: use CSS logical properties (`margin-inline-start` not `margin-left`) from the start

---

## 13. PWA Requirements

- Installable (Web App Manifest)
- Works offline for: prayer times (cached), previously viewed listings
- Service worker via Vite PWA plugin (`vite-plugin-pwa`)
- Push notifications for prayer time reminders (opt-in)
- Fast: target Lighthouse score 90+ on mobile

---

## 14. Phase Breakdown

### Phase 1 — MVP (ship this)

- [ ] Prayer Times screen (Aladhan API, live countdown)
- [ ] Halal Directory (list + map, static data from Airtable/JSON)
- [ ] Mosques Directory (list + detail, static data)
- [ ] Prayer Spots (map view, static data)
- [ ] Events (list + detail, static data)
- [ ] Bottom navigation
- [ ] Design system (colours, typography, components)
- [ ] PWA manifest + offline caching
- [ ] EN + DE language support

### Phase 2 — Growth

- [ ] Arabic (RTL) language support
- [ ] Community submission flow (Submit form → admin approval)
- [ ] Featured listings payment flow (Stripe)
- [ ] Push notification prayer reminders
- [ ] User accounts (save favourites)

### Phase 3 — Scale

- [ ] Admin dashboard
- [ ] Business owner self-serve portal
- [ ] iOS / Android PWA distribution via stores
- [ ] Expand beyond Vienna (other Austrian cities)

---

## 15. Success Metrics (MVP)

- 200 installs (PWA) in first month
- 5 featured business listings signed up
- Lighthouse mobile score ≥ 90
- All 5 features functional and bug-free
- Works offline for core features

---

## 16. Build Rules for Claude Code

- Build one feature at a time, in the order listed in Phase 1
- After each feature: run `typecheck`, `lint`, `test` — fix before continuing
- Never modify files outside the current feature's folder
- All user-facing strings must go through `i18next` — no hardcoded text
- Use CSS custom properties for all colours — no hardcoded hex in components
- All API calls go in `src/services/` — never inline in components
- Every feature must handle: loading state, error state, empty state
- Map components must lazy-load (they're heavy)
- Do not install new packages without flagging it first
