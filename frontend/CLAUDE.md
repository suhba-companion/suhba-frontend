# PRD — Suhba (صُحبة / su7ba)
Version: 2.0 — MVP (aligned with wireframe v3)
Status: Active Development
Platform: PWA (Progressive Web App) — mobile-first
Stack: React + TypeScript + Tailwind CSS + Vite

---

## 1. What Is Suhba?
Suhba (صُحبة — Arabic for "companionship") is a Vienna-focused Muslim community PWA. It serves as the daily digital companion for Muslim residents and tourists — helping them find prayer spots, halal businesses, and providing Azkar and Duaa for daily spiritual practice.
- App name display: **su7ba** (Arabic chat alphabet style)
- Tagline: *Dein muslimischer Begleiter in Wien.*

---

## 2. Target Users
| User | Description |
|---|---|
| Muslim Viennese resident | Uses the app daily for Azkar, nearby prayer spots, halal food |
| Muslim tourist | Visiting Vienna, needs quick answers: where to pray, where to eat |
| Business owner | Wants visibility in the halal directory |

---

## 3. Core Problem
Muslim residents and tourists in Vienna have no single, reliable, community-focused digital resource. Information is scattered across outdated websites, Facebook groups, and word of mouth. Suhba consolidates the essentials into one beautiful, fast, trustworthy app.

---

## 4. Navigation Structure
Bottom navigation (4 tabs — always visible):
```
⌂ Start  |  ◎ Orte  |  ✦ Halal  |  ☽ Azkar
```

- **Start (Home)**: Daily Dhikr card + quick access grid + nearby feed
- **Orte (Spots)**: Prayer spots + mosques — list + map view
- **Halal**: Halal business directory
- **Azkar**: Azkar after prayer + Duaa collection

---

## 5. Features & User Stories

### Feature 1 — Home Screen
Purpose: Daily spiritual anchor + app entry point

- US-1.1 As a daily user, I want to see a featured Dhikr on the home screen so I can start my day with remembrance of Allah.
- US-1.2 As a user, I want to see the Arabic text, transliteration, and English meaning of each Dhikr so I can read and understand it.
- US-1.3 As a user, I want to see how many times the Dhikr should be repeated so I know my target.
- US-1.4 As a user, I want to expand an info panel to read the hadith source so I understand its significance.
- US-1.5 As a user, I want to cycle through multiple Dhikr cards (dot indicators + next button) so I can choose what to focus on.
- US-1.6 As a user, I want a 2×2 quick access grid linking to all main features so I can navigate with one tap.
- US-1.7 As a user, I want a nearby feed (max 3 items) showing mosque events, new halal spots, and Juma reminders so I stay informed without opening each section.

**Requirements:**
- Dhikr card: Arabic (RTL, Amiri), transliteration (Georgia italic), meaning, count badge, ℹ toggle, dot nav
- Decorative rings as background detail on card
- Quick grid: 2×2, icon + label + subtitle per tile
- Nearby feed: title, location/distance, tag chip, time per item

**Out of scope:** Push Dhikr reminders, tap counter mechanic

---

### Feature 2 — Spots (Gebetsorte & Moscheen)
Purpose: Find the nearest place to pray

- US-2.1 As a user, I want to search for prayer spots and mosques by name.
- US-2.2 As a user, I want to toggle between list view and map view.
- US-2.3 As a user, I want to filter by type: Alle / Moscheen / Gebetsorte / Sonstige.
- US-2.4 As a user, I want to filter by amenities: Juma, Wudu, Frauenbereich, Parkplatz, Geöffnet jetzt.
- US-2.5 As a user, I want amenity icons on each card (🟢/🔴 open, 🕌 Juma, 💧 Wudu, 🧕 sisters, 🅿️ parking) at a glance.
- US-2.6 As a user, I want to see distance (km) and walking time on each card.
- US-2.7 As a user, I want to tap "Route" directly from the card to open directions.
- US-2.8 As a user, I want to see how many results match my filters.
- US-2.9 As a tourist, I want a map with colour-coded pins and a legend so I can orient myself.
- US-2.10 As a community member, I want to tap "+ Ort hinzufügen" to suggest a new spot.

**Spot Detail:**
- US-2.11 As a user, I want a detail page with: full address, Juma time, opening hours, map preview.
- US-2.12 As a user, I want a hero section (gradient) showing name, type, distance, open/closed prominently.
- US-2.13 As a user, I want to read community reviews (username, stars, text, date).
- US-2.14 As a user, I want to suggest a correction via "+ Änderung".

**Requirements:**
- List cards: name, type chip, amenity icon row, distance, walk, Route button
- Map: Leaflet + OSM, colour-coded pins (Moschee=primary, Gebetsort=moss, Sonstige=sand), legend
- Filter dropdown: type pills + amenity pills + reset/apply
- Active filter count on button
- Detail hero: gradient, type label, Amiri name, meta row, amenity icons
- Detail info table: address, Juma, hours
- Reviews: read-only for MVP

**Out of scope:** Live occupancy, indoor navigation, review submission

---

### Feature 3 — Halal Directory
Purpose: Find halal-certified food and businesses in Vienna

- US-3.1 As a user, I want to search for halal businesses by name.
- US-3.2 As a user, I want to filter by category: Alle / Restaurants / Cafés / Metzgereien / Lebensmittel.
- US-3.3 As a user, I want to see featured businesses at the top with a visual card.
- US-3.4 As a user, I want to see halal certification status (HMA-Zertifiziert vs Selbst-zertifiziert) with visual distinction.
- US-3.5 As a user, I want distance, walking time, and star rating on each card.
- US-3.6 As a user, I want a type chip on each card.
- US-3.7 As a business owner, I want to tap "+ Betrieb" to submit my business.
- US-3.8 As a browsing user, I want featured cards to have a visual thumbnail area so the section feels rich.

**Requirements:**
- Featured row: 2-col horizontal cards, image/icon area, name, "Empfohlen" badge, distance
- Results list: type chip, cert badge (✓ HMA or plain), distance, walk, rating
- Category filter dropdown with pills
- "+ Betrieb" CTA in results header

**Out of scope:** Business detail page, map view, ratings submission (Phase 2)

---

### Feature 4 — Azkar & Duaa
Purpose: Daily spiritual practice

- US-4.1 As a user, I want post-prayer Azkar with Arabic, transliteration, and meaning.
- US-4.2 As a user, I want the repetition count clearly shown on each Azkar.
- US-4.3 As a user, I want to switch between "Azkar" and "Duaa" tabs.
- US-4.4 As a user, I want situational Duaa (waking up, leaving home, seeking knowledge) with title, Arabic, transliteration, meaning.
- US-4.5 As a user, I want a "Tipp des Tages" gradient card at the top so I learn something beneficial daily.

**Requirements:**
- Two tabs: Azkar | Duaa (active = bottom border)
- Azkar cards: Arabic RTL (Amiri), transliteration (Georgia italic), meaning, count badge
- Duaa cards: situation title bold, Arabic, transliteration, meaning
- Daily tip: gradient card (#485530 → #5A6840)
- Data: ships as static JSON in `src/data/dhikr.json` + `src/data/duaa.json` — no API

**Out of scope:** Tap counter, audio, custom Azkar, notifications

---

## 6. Design System

### Colour Tokens
```ts
primaryDark: "#323B24"   // status bar only
primary:     "#485530"   // top bar, bottom nav, buttons, CTAs
moss:        "#5A6840"   // gradients, accents
sage:        "#7A8560"   // inactive nav icons
sageLight:   "#A8B28A"   // borders, map tint
sageTint:    "#E0D8C8"   // filter active bg, info panels
creamBg:     "#EBE0CC"   // screen background
creamCard:   "#F7F2E8"   // card background
border:      "#D4C9B0"   // all borders
sand:        "#B89A70"   // warm accent
textDark:    "#252818"   // primary text
textMuted:   "#5E5E46"   // labels, secondary
```

### Typography
- Arabic + titles: `'Amiri', serif`
- Transliteration: `Georgia, serif italic`
- UI / body: `sans-serif`
- Section labels: `10px, uppercase, letter-spacing 0.1em`

### Logo
- Bird on branch SVG, 30–32px in top bar
- Rounded rect bg: moss, bird: creamCard, beak: sand, branch: sageLight

### Key Component Rules
- Cards: `borderRadius: 11`, `border: 1px solid #D4C9B0`, bg creamCard
- Pills: `borderRadius: 20`, active = primary + creamCard, inactive = creamCard + textMuted
- Bottom nav: background: primary, active = creamCard + white underline bar
- Gradient hero: `linear-gradient(140deg, #485530, #5A6840)`
- All colour values via CSS custom properties — never hardcoded in components

---

## 7. Screen Inventory
| Screen | Route |
|---|---|
| Home | `/` |
| Spots List | `/spots` |
| Spot Detail | `/spots/:id` |
| Halal Directory | `/halal` |
| Azkar | `/azkar` |
| Submit Spot | `/submit/spot` |
| Submit Business | `/submit/business` |
| 404 | `*` |

---

## 8. Data Model
```ts
interface Dhikr {
  id: string;
  ar: string;
  latin: string;
  en: string;
  count: string;        // "100×"
  hadithInfo: string;
}

interface Duaa {
  id: string;
  title: string;        // "Beim Aufwachen"
  ar: string;
  latin: string;
  en: string;
}

interface PrayerSpot {
  id: string;
  name: string;
  type: 'Moschee' | 'Gebetsort' | 'Sonstige';
  address: string;
  district: string;
  lat: number;
  lng: number;
  open: boolean;
  jumaTime: string | null;
  wudu: boolean;
  sisters: boolean;
  parking: boolean;
  openingHours?: string;
  distanceKm?: number;   // computed at runtime
  walkMin?: number;      // computed at runtime
}

interface SpotReview {
  id: string;
  spotId: string;
  user: string;
  stars: number;
  text: string;
  createdAt: string;
}

interface HalalBusiness {
  id: string;
  name: string;
  type: 'Restaurant' | 'Café' | 'Metzgerei' | 'Lebensmittel' | 'Sonstige';
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  certStatus: 'HMA-Zertifiziert' | 'Selbst-zertifiziert' | 'Muslim-Owned';
  rating: number;
  featured: boolean;
  distanceKm?: number;
  walkMin?: number;
}
```

---

## 9. API & Data Sources

### MasjidiApp API — Mosque & Spot Data
- Base URL: `https://api.masjidiapp.com`
- Dev key: `123-test-key` → `VITE_MASJIDI_API_KEY`
- Production key: WhatsApp +1 530 508 6624 before launch

```
GET /masjid?lat=48.2082&lng=16.3738&radius=15
GET /masjid/{id}
GET /masjid/{id}/iqamah
```

### Maps — Leaflet + OpenStreetMap
- Free, no key. Package: `leaflet` + `react-leaflet`. Always lazy-load.

### Static Data
- `src/data/dhikr.json` — Dhikr collection
- `src/data/duaa.json` — Duaa collection

### Supabase
| Table | Content |
|---|---|
| `halal_businesses` | Curated halal directory |
| `prayer_spots` | Community-submitted spots |
| `spot_reviews` | Read-only MVP, write Phase 2 |
| `events` | Home feed items |

### Service Layer
```
src/services/
  masjidiService.ts
  supabaseClient.ts
  halalService.ts
  spotsService.ts
  eventsService.ts
```

### Env Vars
```env
VITE_MASJIDI_API_KEY=123-test-key
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 10. Monetization
- Featured halal listings: "Empfohlen" badge, top of directory — monthly fee
- Promoted events: home feed placement — per event

---

## 11. Language
- Primary: German (all UI labels)
- Arabic: Dhikr, Duaa, app name — always Amiri font + `direction: rtl`
- Secondary: English (meanings in Dhikr/Duaa cards)
- All DE/EN strings via i18next — no hardcoded text in components
- CSS logical properties from day one

---

## 12. PWA Requirements
- Installable (Web App Manifest)
- Offline: Dhikr/Duaa always available (static JSON), previously viewed spots cached
- Service worker: `vite-plugin-pwa`
- Target: Lighthouse mobile ≥ 90

---

## 13. Build Order (Phase 1)
1. `design-system` → tokens, Logo, Card, Pill, TopBar, NavBar, Sect
2. `home` → Dhikr card, quick grid, nearby feed
3. `spots` → list + map + filters + Route button
4. `spot-detail` → hero, info table, map, reviews
5. `halal` → featured row, filtered list
6. `azkar` → tabs, Azkar cards, Duaa cards, daily tip
7. `submit-forms` → spot + business submission
8. `pwa` → manifest, service worker, offline
9. `i18n` → wire i18next across all screens

---

## 14. Build Rules for Claude Code
- One feature per session, scope to `src/features/[name]` only
- After each feature: `npm run typecheck && npm run lint && npm run test`
- Dhikr + Duaa: static JSON in `src/data/` — no API calls
- Arabic text: always `fontFamily: "'Amiri', serif"` + `direction: "rtl"`
- Distance + walk: computed from geolocation at runtime, never stored
- Map: always `React.lazy()` — never block initial render
- Every feature: loading + error + empty states
- Colours: CSS custom properties only — no hex in components
- No hardcoded strings — all through i18next

---

## 15. Coding Rules (ALWAYS follow these)

### General
- Write TypeScript. Never use `any` — use `unknown` and narrow it.
- Prefer `interface` over `type` for object shapes.
- All functions must have explicit return types.
- No magic numbers — use named constants.
- No commented-out code in commits.
- Fail loudly in dev, fail gracefully in production.

### Components
- One component per file.
- File name matches component name (PascalCase).
- Props must have a named interface: `interface ButtonProps { ... }`
- Keep components under 150 lines. If longer, split it.
- No business logic in UI components — extract to a custom hook.
- Prefer composition over props drilling beyond 2 levels (use Context or Zustand).

### Hooks
- Custom hooks live in `src/hooks/` or co-located in the feature folder.
- Name must start with `use`.
- A hook should do one thing. If it's doing 3 things, split it.

### State
- Local UI state → `useState` / `useReducer`
- Shared app state → Zustand store
- Server state → React Query (never store API responses in Zustand)
- Don't put derived values in state — compute them inline or with `useMemo`.

### Styling
- Use Tailwind utility classes. No inline styles.
- Responsive-first: mobile → tablet → desktop.
- CSS custom properties for theme tokens (colors, spacing, radii).
- No hardcoded color hex values in components — use Tailwind config tokens.

### API / Services
- All fetch logic lives in `src/services/`, never inline in components.
- Always handle loading, error, and empty states.
- Type all API responses. Never trust `any` from the server.
- Use React Query for all async data — don't roll your own fetch + useState.

### Error Handling
- Wrap page-level components in `<ErrorBoundary>`.
- All async functions must have try/catch or `.catch()`.
- Log errors in dev. Show user-friendly messages in production.
- Never swallow errors silently.

---

## 16. What NOT To Do
- Don't use `useEffect` to sync state — it's almost always wrong
- Don't mutate state directly
- Don't fetch data inside `useEffect` — use React Query
- Don't put route logic inside components
- Don't import from `../../../` more than 2 levels — use path aliases
- Don't create a new component for every small variation — use props
- Don't skip TypeScript generics on React Query calls
- Don't write tests after the fact for critical logic — write them as you go

---

## 17. Path Aliases
```ts
// tsconfig.json / vite.config.ts
@components → src/components
@features   → src/features
@hooks      → src/hooks
@pages      → src/pages
@services   → src/services
@store      → src/store
@types      → src/types
@utils      → src/utils
```

---

## 18. Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run test:ui      # Run tests with UI
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # tsc --noEmit
```

**After every code change, run:**
```bash
npm run typecheck && npm run lint && npm run test
```
If any of these fail, fix before moving on.

---

## 19. Testing Rules
- Every custom hook must have a test.
- Every utility function must have a test.
- Every critical user flow must have an integration test.
- Test behaviour, not implementation details.
- Aim for: does this work the way the user expects? Not: does this call this function?

---

## 20. Git Conventions
- Branch: `feature/`, `fix/`, `chore/`
- Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`
- Never commit directly to `main`
- Each PR = one feature or fix only

---

## 21. Performance Rules
- Lazy-load all routes: `React.lazy()` + `<Suspense>`
- Memoize expensive computations with `useMemo`
- Memoize stable callbacks passed as props with `useCallback`
- Don't `memo()` everything — only when profiling shows it helps
- Images: always specify `width` and `height`, use WebP where possible

---

## 22. Accessibility (a11y)
- All interactive elements must be keyboard accessible
- All images must have `alt` text
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`) not `<div>` for everything
- Color contrast must pass WCAG AA minimum

---

## 23. Scope Rules (IMPORTANT)
- When implementing a feature, **only touch files related to that feature**
- Do not refactor unrelated code unless explicitly asked
- Do not install new packages without asking first
- Do not change the folder structure without asking first
- When unsure → ask, don't guess

---

## 24. Code Quality Rules (Fowler)
- Component over 150 lines → split it
- Logic + JSX mixed together → extract to a custom hook
- Same pattern in 2+ places → extract shared component or hook
- More than 4 props → group into an object or rethink the component
- `if/else` on a type → use a component map object instead
- Props passed but never used → remove them
- Comment explaining what code does → rename or extract until no comment needed
- `props.a.b.c.d` in JSX → destructure early or reshape the data upstream
- Component that only passes props through → remove it or give it a real job
- State that's only sometimes valid → split into separate components

---

## 25. Before Marking Any Task Done
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Tests pass
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Works on mobile (responsive)
- [ ] No `console.log` left in code
