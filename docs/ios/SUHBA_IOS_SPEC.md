# Suhba iOS Rebuild Spec

How to rebuild the Suhba PWA as a native SwiftUI app so that it compiles, runs, and
looks like the web app rather than "a SwiftUI app with our colours in it".

**Source of truth is the web code, not this file.** Every number below was read out of
`frontend/suhba/src` on 2026-10-24. Where this file and the web code disagree, the web
code wins and this file is wrong and should be corrected. Paths are given per section so
the original can always be opened.

**Target:** iOS 17+, SwiftUI, no third-party UI framework. The reference viewport is
390 x 664 pt (iPhone 13 Safari), because that is what the web layout is tuned for.

---

## 0. Read this first: why the UI breaks

A SwiftUI port of a Tailwind layout does not usually break on colours. It breaks on
sizing. These are the failure modes, in the order they actually bite:

1. **Text collapses or truncates.** A `Text` inside an `HStack` gives up its width
   before a sibling does. Every multi-line label needs
   `.fixedSize(horizontal: false, vertical: true)`, and every row that must not squash
   its text needs the *other* side marked `.layoutPriority(-1)` or a fixed width.
   Symptom: card bodies render as one truncated line, or disappear entirely.
2. **A scroll area that cannot shrink.** The web had this exact bug in `Modal.tsx`: a
   flex child without `min-height: 0` stays as tall as its content, so it never scrolls
   and overflows its parent. The SwiftUI analogue is a `ScrollView` inside a `VStack`
   with no height constraint, or a sheet whose content is not wrapped in a `ScrollView`
   at all. Symptom: the bottom of a sheet is unreachable.
3. **`List` instead of `ScrollView`.** `List` brings its own row insets, separators,
   selection highlight and background. The web rows are cards with 16 pt gaps on a white
   page. Use `ScrollView` + `LazyVStack(spacing: 16)`. If `List` is unavoidable:
   `.listStyle(.plain)`, `.listRowSeparator(.hidden)`, `.listRowInsets(EdgeInsets())`,
   `.scrollContentBackground(.hidden)`.
4. **System navigation chrome.** `NavigationStack` draws its own bar; the app already
   has a custom `TopBar`. Showing both gives a double header and a jumping title.
   Use `.toolbar(.hidden, for: .navigationBar)` or no `NavigationStack` at all.
5. **System `TabView`.** The web nav bar is 5 custom tabs, one of which renders the
   Arabic glyph `حلال` in Amiri instead of an icon. A system `TabView` cannot do that
   and will also move the bar on iPad. Build the bar by hand (section 7.2).
6. **Dynamic Type at the wrong place.** `.font(.system(size:))` is fixed, while
   `.custom(_:size:)` scales with the user's text size unless you pass `fixedSize:`.
   Mixing them means Arabic grows while its translation does not. Decide once:
   this spec assumes `fixedSize:` everywhere, matching the web, which does not scale.
7. **Gradients at the wrong angle.** CSS `linear-gradient(140deg, …)` is not
   `.topLeading → .bottomTrailing`. Use the `CSSLinearGradient` helper
   (`DesignSystem/SuhbaStyle.swift`), which converts a CSS angle for any frame size.
8. **Safe areas.** Bottom nav and sheet content must clear the home indicator, the top
   bar must clear the status bar. The web does this with
   `env(safe-area-inset-*)`; in SwiftUI it is `.safeAreaInset(edge:)`, never a
   hardcoded 34 pt.

A build that compiles is not a passing result. Section 10 is the acceptance test.

---

## 1. Measurement translation

CSS px and SwiftUI pt are 1:1 here. No conversion, no "roughly".

### 1.1 Spacing scale (Tailwind → pt)

| class | pt | | class | pt |
|---|---|---|---|---|
| `0.5` | 2 | | `4` | 16 |
| `1` | 4 | | `5` | 20 |
| `1.5` | 6 | | `6` | 24 |
| `2` | 8 | | `8` | 32 |
| `2.5` | 10 | | `10` | 40 |
| `3` | 12 | | `16` | 64 |

`space-y-N` / `gap-N` → `VStack(spacing: N)` / `HStack(spacing: N)`.
`p-4` → `.padding(16)`. `px-4 py-2.5` → `.padding(.horizontal, 16).padding(.vertical, 10)`.

### 1.2 Type scale

| class | size | line-height | SwiftUI |
|---|---|---|---|
| `text-[10px]` | 10 | normal | `.system(size: 10)` |
| `text-[11px]` | 11 | normal | `.system(size: 11)` |
| `text-xs` | 12 | 16 | `.system(size: 12)` + `lineSpacing` to 16 |
| `text-[13px]` | 13 | normal | `.system(size: 13)` |
| `text-sm` | 14 | 20 | `.system(size: 14)` + `lineSpacing` to 20 |
| `text-base` | 16 | 24 | `.system(size: 16)` |
| `text-lg` | 18 | 28 | `.system(size: 18)` |
| `text-xl` | 20 | 28 | `.system(size: 20)` |
| `text-2xl` | 24 | 32 | `.system(size: 24)` |
| `text-3xl` | 30 | 36 | `.system(size: 30)` |
| `text-[1.65rem]` | 26.4 | `leading-loose` = 52.8 | Amiri, see 4.2 |

Multipliers: `leading-none` 1.0, `leading-tight` 1.25, `leading-snug` 1.375,
`leading-normal` 1.5, `leading-relaxed` 1.625, `leading-loose` 2.0.

CSS line-height is the whole line box; SwiftUI `lineSpacing` is the gap *between* lines.
Use the existing helper, do not eyeball it:

```swift
.cssLineHeight(20, fontName: "Amiri-Regular", size: 14)   // custom font
.cssLineHeightSystem(20, size: 14, weight: .regular)      // system font
```

Weights: `font-medium` → `.medium`, `font-semibold` → `.semibold`, `font-bold` → `.bold`.
`tabular-nums` → `.monospacedDigit()`. `tracking-[0.1em]` → `.tracking(size * 0.1)`.
`uppercase` → `.textCase(.uppercase)`.
`truncate` → `.lineLimit(1).truncationMode(.tail)` — and it *is* one line on purpose.

### 1.3 Borders, radii, shadows

- Border `1px solid` → `.overlay(RoundedRectangle(cornerRadius: r).stroke(color, lineWidth: 1))`.
  A `.border()` modifier draws a square border and will look wrong on a rounded card.
- `rounded-card` = 11, `rounded-pill` = 20, `rounded-full` = `Capsule()`,
  `rounded-xl` = 12, `rounded-2xl` = 16, `rounded-md` = 6.
- Use `style: .circular`. CSS radii are circular arcs; `.continuous` is a squircle and
  reads visibly softer at radius 11. Pick one and never mix.
- When a pill's radius (20) exceeds half its height, CSS clamps it to a capsule. Any
  pill under 40 pt tall is therefore a `Capsule()`, not a 20 pt rounded rect.
- `shadow-sm` = `.shadow(color: .black.opacity(0.05), radius: 1, x: 0, y: 1)`
- `shadow-md` = `.shadow(.black.opacity(0.1), radius: 2.5, y: 4)` + `.shadow(.black.opacity(0.1), radius: 1.5, y: 2)`
- `shadow-xl` = `.shadow(.black.opacity(0.1), radius: 10, y: 20)` + `.shadow(.black.opacity(0.1), radius: 4, y: 8)`

### 1.4 Opacity suffixes

`text-cream-card/80` is the *colour* at 80 %, not the view. Use
`.foregroundStyle(SuhbaColor.creamCard.opacity(0.8))`, never `.opacity(0.8)` on the view,
or the whole subtree fades.

---

## 2. Colour tokens

From `frontend/suhba/tailwind.config.js`. The palette is **green on white**. Any cream
or sand-coloured background is an outdated design: `frontend/CLAUDE.md` §6 still lists the
old cream palette and is stale.

| Token | Hex | Used for |
|---|---|---|
| `primary` | `#051F20` | buttons, active nav, badges, headings on light |
| `badge` | `#092625` | active badge background |
| `sand` | `#163832` | dark accent, gradient start |
| `moss` | `#235347` | filled buttons, active pills, filter toggle |
| `selected` | `#4A7C6E` | hover/pressed overlay |
| `sage` | `#8EB69B` | secondary icons |
| `sage-light` | `#b5d4bc` | focus/hover borders |
| `sage-tint` | `#DAF1DE` | chip and info-panel background |
| `cream-bg` | `#FFFFFF` | screen background |
| `cream-card` | `#FFFFFF` | card surface |
| `divider` | `#E2E8F0` | every border and separator |
| `text-dark` | `#0F172A` | primary text |
| `text-muted` | `#64748B` | labels, secondary text |

Gradients (`CSSLinearGradient(angle: 140, colors:)`):
- hero (Dhikr card): `#051F20 → #235347`
- tip (quick tiles, daily tip, Sabah card): `#163832 → #235347`
- Masa card reverses the tip colours: `#235347 → #051F20`

Cards are white on white; the only thing separating them from the page is the
`divider` border plus `shadow-sm`. Drop either and the screen looks flat and wrong.

Event category chips in the detail sheet use Tailwind's own 100/800 pairs, not the brand
palette: Gebet emerald, Vortrag blue, Kurs purple, Workshop indigo, Community orange,
Jugend yellow, Sport red, Spende pink, Neue Muslime teal, Sonstige gray. See
`EventDetailModal.tsx` `CATEGORY_COLORS`.

---

## 3. Iconography

The web uses **Phosphor Icons**, not SF Symbols. SF Symbols have a different stroke
weight, optical size and metrics; swapping them is the single most visible "this is not
the same app" tell.

- Ship Phosphor glyphs in the asset catalog as template images and render them through
  `PhosphorIcon(name:size:)` (`DesignSystem/Components/Primitives.swift`).
- Naming mirrors the web: `ph-<icon>-<weight>`, e.g. `ph-clock-regular`,
  `ph-arrow-right-bold`.
- Weights in use: `regular` (default), `bold` (small inline chips), `duotone`
  (quick-grid tiles, halal seal), `fill` (open/closed dot, active nav icon).
- Sizes are literal: chips 10–11, meta rows 12–13, amenity rows 18, quick grid 24,
  nav bar 22, halal placeholder 40.
- `RootTabView.swift` currently uses `Image(systemName:)` for tab items. That is a
  divergence to fix, not a precedent to copy.

Icon inventory per screen: see the `@phosphor-icons/react` import at the top of each
`.tsx` file; the import list is the complete set for that screen.

---

## 4. Typography

### 4.1 UI font
The web uses `system-ui`, which on iOS *is* SF Pro. Use `.system(size:weight:)` and do
not bundle anything.

### 4.2 Amiri (Arabic, and Latin display)
`Amiri-Regular.ttf`, `Amiri-Bold.ttf`, `Amiri-Italic.ttf` are already in
`Suhba/Resources/Fonts/`. They must be listed in `Info.plist` under
`UIAppFonts`, otherwise `Font.custom` silently falls back to SF and every Arabic line
renders in the wrong face without an error.

Where Amiri is used:
- Dhikr card Arabic: 30 pt, `leading-relaxed` (48.75), right-aligned, RTL
- Azkar / Duaa card Arabic: 26.4 pt, `leading-loose` (52.8), right-aligned, RTL
- Azkar nav cards Arabic heading: 20 pt semibold, RTL
- Quick-grid halal tile and nav bar halal tab: `حلال`, 24 pt / 20 pt
- Halal placeholder heading: 20 pt
- Transliteration is **Georgia italic**, 14 pt, colour `moss` — `.custom("Georgia-Italic", fixedSize: 14)`

### 4.3 Arabic / RTL rules
```swift
Text(dhikr.ar)
    .font(.amiri(26.4))
    .multilineTextAlignment(.trailing)
    .frame(maxWidth: .infinity, alignment: .trailing)
    .environment(\.layoutDirection, .rightToLeft)
```
Set `layoutDirection` on the Arabic `Text` only. Setting it on a container mirrors
padding, icons and chevrons across the whole screen.

---

## 5. Core components

Exact values; each maps to one web file.

### 5.1 Card — `components/Card.tsx`, used by every list row
White fill, 1 pt `divider` border, radius 11, `shadow-sm`, inner padding 16.
List rows additionally: `VStack(alignment: .leading, spacing: 12)`.
Already implemented as `.suhbaCard()` in `DesignSystem/SuhbaStyle.swift`.

### 5.2 Pill / filter chip — `components/Pill.tsx`, `SpotsFilter.tsx`
Padding 12 / 4 (filter pills) or 12 / 6 (toolbar pills), 12–14 pt medium, `Capsule()`.
Active: `moss` fill, white label, no border. Inactive: white fill, `text-muted` label,
1 pt `divider` border.

### 5.3 Meta chip (card badges) — `EventCard.tsx`
Padding 8 / 2, 11 pt semibold, `Capsule()`. Category chip: `sage-tint` fill,
`text-muted` label, 10 pt icon. Outlined chip (recurrence, audience, registration):
white fill, 1 pt `sage-light` border, `moss` label.

### 5.4 Primary button — `EventCard.tsx` route button
`primary` fill, white 12 pt medium label, padding 16 / 8, `Capsule()`, min height 36.
Full-width variant (`Button.tsx` size `lg`): tip gradient, height 44, radius 20,
14 pt medium.
iOS deviation that is allowed and wanted: raise any tap target under 44 pt to 44 pt of
*hit area* via `.contentShape(Rectangle()).frame(minHeight: 44)` without changing the
visible pill.

### 5.5 Search field — `EventsPage.tsx`, `SpotsPage.tsx`
Full width, white, 1 pt `divider`, radius 11, padding 16 / 10, 14 pt.
Placeholder `text-muted`. Focus changes the border to `sage-light` — in SwiftUI bind
`@FocusState` and swap the stroke colour, do not use the default focus ring.

### 5.6 Section label — `components/Sect.tsx`
10 pt medium, uppercase, tracking 1.0 (0.1em), `text-muted`.

### 5.7 Sheet — `components/Modal.tsx`
Bottom sheet, max height 90 % of the screen, radius 16 on the top corners, white.
Header: sticky, 16 / 12 padding, 16 pt semibold title (one line, truncating), close
button right. Body: scrollable, and the scroll view must end above the home indicator.

```swift
.sheet(item: $selected) { item in
    SheetScaffold(title: item.title) { DetailBody(item) }
        .presentationDetents([.fraction(0.9)])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(16)
}
```
The body is a `ScrollView` with `.safeAreaInset(edge: .bottom)` or bottom padding equal
to the home-indicator inset. This is where the web bug lived; do not reproduce it.

### 5.8 Loading / empty / error — `components/LoadingState.tsx`
Loading: centred 72 pt spinner in `primary`, optional 14 pt muted label, 64 pt vertical
padding. Empty: centred 14 pt muted sentence, 32 pt horizontal padding. Error: same
shape, text in `#DC2626`. Every tab needs all three; the web has them and a missing
state reads as a broken screen.

### 5.9 Form field — `features/submit/FormField.tsx`
Label 12 pt medium uppercase, tracking 0.08em, `text-muted`, 4 pt above the control.
Control: white, 1 pt `divider`, radius 11, padding 12 / 10, 14 pt.
Error line: 12 pt, red, directly under the control.

---

## 6. App shell — `src/App.tsx`

Vertical stack: `TopBar` (fixed) → content (scrolls) → `NavBar` (fixed).
Screen background `#FFFFFF`. Horizontal safe-area insets are respected on all screens.

### 6.1 TopBar — `components/TopBar.tsx`
Height 56 + top safe area, white, 1 pt bottom `divider`, horizontal padding 16, gap 12.
- Root screens: title area is **empty**; only the right-hand prayer countdown shows.
- Pushed screens (forms, legal): back arrow `←` plus 18 pt semibold title, truncating.
- Right action on every tab except Home: `PrayerCountdown`, an inline run of
  `<time> bis <Gebet>` at 12 pt semibold, digits monospaced, "bis" muted and regular.

### 6.2 NavBar — `components/NavBar.tsx`
Height 64 + bottom safe area, white, 1 pt top `divider`, shadow upward
(`.black.opacity(0.06)`, radius 2, y −1). Five equal tabs:
`start`, `orte`, `halal`, `events`, `azkar`.
Icons 22 pt: House, Mosque, (halal = Amiri `حلال` at 20 pt), Calendar, BookOpen.
Active: `primary`, icon weight `fill`. Inactive: `primary` at 35 % opacity, weight
`regular`. Label 11 pt medium, 2 pt under the icon.

### 6.3 Legal footer — `features/legal`, `features/social`
Below the content on every scrolling screen: social links then Impressum / Datenschutz,
padding 16 horizontal, 24 bottom. Legally required (§ 5 ECG), so it is not optional
chrome: it must be reachable from every view.

---

## 7. Screens

Each section lists structure top to bottom. Numbers that are not repeated are inherited
from section 5.

### 7.1 Home — `features/home/HomePage.tsx`
Page padding 16, section spacing 24, extra 32 at the bottom.
1. **PrayerTimesWidget** — hero-gradient card, radius 11, padding 16, `shadow-md`
   (loading placeholder is the same card at a fixed height of 116). Inside: a row of six columns
   (Fajr, Shorouk, Dhuhr, Asr, Maghrib, Isha), each a 12 pt-radius tile, padding 10 / 4,
   icon 18, name 10 pt, time 12 pt medium monospaced. Next prayer: `white/20` fill,
   2 pt `white/40` ring, amber-200 icon, white text. Others: `white/10`, emerald-tinted
   text at 60 % / 40 % for Shorouk.
2. **DhikrCard** — hero gradient, padding 20, radius 11, white text. Decorative three
   concentric circles, 200 pt, 10 % opacity, anchored 40 pt beyond the top-right corner
   and clipped. Count badge `white/20`, 12 pt semibold, capsule. Arabic 30 pt Amiri RTL.
   Transliteration 14 pt italic at 80 %. Meaning 14 pt at 70 %. Footer row: dot
   indicators (active 16 x 8 rounded, inactive 8 x 8 at 40 %), tasbih counter button,
   "Weiter" 12 pt medium with a 13 pt bold arrow.
3. **Quick grid** — section label, then 2 x 2 tiles, gap 12, tip gradient, radius 11,
   padding 16 / 8, icon 24 duotone (halal tile: `حلال` 24 pt Amiri), label 12 pt
   semibold centred.
4. **Nearby feed** — section label, then up to 3 cards: title 14 pt semibold (one line),
   location 12 pt muted (one line), tag 12 pt medium right-aligned, distance and time
   12 pt muted, route button.

### 7.2 Spots — `features/spots/SpotsPage.tsx`
1. Optional banner when location is denied: 12 pt muted, centred, `sand/20` fill.
2. Search field.
3. Toolbar row, horizontally scrollable, no scrollbar: segmented Liste/Karte (white,
   `divider` border, capsule, active segment `moss`), filter button (`moss` capsule,
   12 pt, white, with a count badge `white/30` 16 x 16), segmented Distanz/Name.
4. Count line 12 pt muted left, "+ Ort hinzufügen" 12 pt medium `primary` right.
5. Expandable filter panel: card, padding 16, section spacing 16. Type pills, amenity
   pills (Juma, Wudu, Schwestern, Parkplatz, Hijab, Gebetskleidung, Geöffnet), then
   Reset (outlined) and Anwenden (`moss`) side by side, height 32.
6. List of spot cards: name 14 pt semibold (one line), address 12 pt muted (one line),
   type 12 pt medium right, amenity icon row (gap 16, icons 18, open/closed dot 12 pt
   fill green/red), distance 12 pt muted, route button.
7. Map view: MapKit, pins coloured by type, same filter state as the list.

### 7.3 Halal — `features/halal/HalalUnavailablePage.tsx`
Currently a placeholder, and the native app must ship the placeholder, not an empty
list: centred card, max width 384, padding 24 / 32, items centred, gap 12. SealCheck
40 pt duotone in `moss`, heading 20 pt Amiri, body 14 pt muted `leading-relaxed`,
"+ Betrieb vorschlagen" 12 pt medium `primary`.
The full directory (`HalalPage.tsx`, `HalalBusinessCard.tsx`) exists in the web code and
is the reference for when it is switched on.

### 7.4 Events — `features/events/EventsPage.tsx`
1. Search field, filter button with count badge, count line, "+ Event hinzufügen".
2. Filter panel: time pills, category pills (Gebet, Vortrag, Kurs, Workshop, Community,
   Jugend, Sport, Spende, Neue Muslime), audience pills, reset / apply.
3. Event card — `EventCard.tsx`, padding 16, inner spacing 12:
   title 14 pt semibold `leading-snug` (one line), organiser 12 pt muted (one line);
   chip row (categories + recurrence); clock row and pin row, icon 12, text 12 pt muted
   (one line each); footer row with free / registration / audience chips on the left and
   the route button on the right.
4. Detail sheet — `EventDetailModal.tsx`:
   header block padding 20 / 16 with the coloured category chips (12 pt semibold,
   padding 10 / 4) and the title at 20 pt semibold `leading-snug`;
   body padding 20, spacing 16: time block on `sage-tint` radius 11 padding 16 with an
   18 pt clock, date 14 pt medium, time 14 pt muted, recurrence 14 pt `moss` medium;
   address block (18 pt pin, address 14 pt, district 12 pt muted); organiser; contact;
   description 14 pt muted `leading-relaxed`; registration link block; full-width route
   button.
5. Registration link — `RegistrationLink.tsx`: `sage-tint` card radius 11 padding 12,
   the URL itself 14 pt `primary` underlined and wrapping (`break-all`), plus a copy
   button that swaps to a check for 2 s. Do not replace this with a "Zur Anmeldung"
   button; showing the target is the point.

### 7.5 Azkar — `features/azkar/AzkarPage.tsx`
Page padding 16, spacing 16.
1. Two gradient nav cards side by side, gap 12, radius 11, padding 16: label 10 pt
   semibold uppercase tracking 0.12em at 70 %, Arabic title 20 pt Amiri semibold RTL,
   count 11 pt at 60 %. Inactive card drops to 60 % opacity; active gets `shadow-md`.
   Sabah uses the tip gradient, Masa the reversed one.
2. Daily tip card: hero gradient, radius 11, padding 16, label 10 pt uppercase at 70 %,
   body 14 pt `leading-relaxed`.
3. Azkar cards: white, radius 11, clipped. Header row padding 16 / 16 / 12 with the
   count badge (`primary` fill, white 12 pt bold, capsule) and, when tappable, a hint
   "zum Zählen tippen →" at 11 pt muted. Arabic 26.4 pt Amiri `leading-loose`, right,
   padding 16, bottom 20. Then a 1 pt `divider` separator and a block with
   transliteration (Georgia italic 14 pt `moss`) and meaning (13 pt muted
   `leading-relaxed`), padding 16 / 12, spacing 6.
4. Duaa cards: same, but the header holds the situation title as a `sage-tint` chip with
   `text-dark` 12 pt semibold.
5. Counter modal: full-screen ring counter (`CounterRing.tsx`), 300 ms ease animation.

### 7.6 Submit forms — `features/submit/`
Spot, Business and Event share `FormField`. Order for events, which was changed
deliberately: title, description, category, **audience**, address, district, start,
end, recurrence, contact, registration, free checkbox. Submit button is full width,
tip gradient, radius 20, height 44. Success and error both need a visible state; a form
that silently does nothing is the most common "broken" report.

---

## 8. Data layer

Base URL `https://suhba-backend.onrender.com`, all routes under `/api/v1`.
`APIClient.swift` already models this.

| Endpoint | Purpose |
|---|---|
| `GET /events`, `/events/upcoming`, `/events/nearby?…` | event list |
| `GET /events/{id}` | detail |
| `POST /events` | submission, header `X-User-Id`, defaults to `anonymous` |
| `GET /prayer-spots`, `/prayer-spots/nearby?latitude=&longitude=&radiusKm=` | spots |
| `GET /prayer-spots/{id}`, `POST /prayer-spots`, `POST /prayer-spots/{id}/upvote` | detail, submit, upvote |
| `GET /halal-spots`, `/halal-spots/featured`, `/halal-spots/nearby?…` | halal |
| `GET /prayer-times` | IZW calendar, drives the widget and the countdown |

Enums must match the backend exactly, or decoding throws and the screen shows an error
for a reason the user cannot see:

- Category: `PRAYER, LECTURE, CLASS, WORKSHOP, COMMUNITY, YOUTH, SPORT, FUNDRAISER, NEW_MUSLIMS, OTHER`
  → Gebet, Vortrag, Kurs, Workshop, Community, Jugend, Sport, Spende, Neue Muslime, Sonstige
- Audience: `SISTERS_ONLY, BROTHERS_ONLY` → "Nur Schwestern", "Nur Brüder"; absent means open to all and nothing is shown
- Recurrence: `WEEKLY, BIWEEKLY, MONTHLY` → Wöchentlich, Zweiwöchentlich, Monatlich
- `startPrayer`: when set, the UI shows the prayer name instead of a clock time
- Decode unknown enum values to the `Sonstige` / `nil` case rather than throwing

Dates: instants come as ISO-8601 UTC and are **always** displayed in
`Europe/Vienna`, locale `de_AT`. Card format: `Sa., 8. Nov., 18:00`. Detail format:
`Samstag, 8. November`. Never use the device time zone.

Distances are computed at runtime from the user's location and never stored. Without
permission the web falls back to the centre of Vienna and says so in a banner; match
that rather than hiding the distances.

German is the only UI language. Strings live in `Resources/Strings.swift`; the web
originals are in `frontend/suhba/src/locales/de.json`.

---

## 9. Build and project hygiene

- `Info.plist`: `UIAppFonts` with all three Amiri files; `NSLocationWhenInUseUsageDescription`
  with a German sentence explaining the distance feature; `UIUserInterfaceStyle = Light`
  (the web has no dark mode, and a half-ported dark mode is the fastest way to a broken UI).
- `ATS`: the API is HTTPS, so no exception is needed. Do not add one.
- Build with the project's own scheme and an iOS 17 simulator:
  `xcodebuild -project "suhba ios/Suhba/Suhba.xcodeproj" -scheme Suhba -destination 'platform=iOS Simulator,name=iPhone 15' build`
- The repo ignores `suhba ios/`, including its `build/` directory. Keep it that way;
  do not commit Xcode build output.

---

## 10. Acceptance test

A screen is done when all of this holds. "It compiles" is step 1 of 6.

1. **Builds clean.** No warnings about missing assets or fonts.
2. **Fonts resolve.** Arabic renders in Amiri, transliteration in Georgia italic.
   Check by eye: if the Arabic looks like SF Arabic, `UIAppFonts` is wrong.
3. **Side by side against the web at 390 x 664.** Open the same screen in the simulator
   and in the browser at that viewport and compare card padding, type sizes, chip
   heights and the gap between rows. The screenshot harness in
   `SuhbaUITests/ScreenshotTests.swift` produces the iOS half.
4. **Long content.** Pick the longest event in the data (the Yasmin Mogahed seminar has a
   ~1400 pt detail body) and confirm the sheet scrolls to the end and the route button
   is fully above the home indicator. Same test for a spot with every amenity and for
   an Azkar entry with a long translation.
5. **Every state.** Loading, empty, error and permission-denied are reachable and
   styled. Kill the network and look at each tab.
6. **Devices.** iPhone SE (small, 375 x 667), iPhone 15 Pro Max (large), and one run
   with the largest Dynamic Type setting to confirm nothing clips into an unreadable
   state, even though the layout itself does not scale.

### Screen checklist

| Screen | Built | Side-by-side | States | Long content |
|---|---|---|---|---|
| Home | ☐ | ☐ | ☐ | ☐ |
| Spots list | ☐ | ☐ | ☐ | ☐ |
| Spots map | ☐ | ☐ | ☐ | ☐ |
| Spot detail | ☐ | ☐ | ☐ | ☐ |
| Halal placeholder | ☐ | ☐ | ☐ | ☐ |
| Events list | ☐ | ☐ | ☐ | ☐ |
| Event detail sheet | ☐ | ☐ | ☐ | ☐ |
| Azkar / Duaa | ☐ | ☐ | ☐ | ☐ |
| Counter | ☐ | ☐ | ☐ | ☐ |
| Submit spot | ☐ | ☐ | ☐ | ☐ |
| Submit business | ☐ | ☐ | ☐ | ☐ |
| Submit event | ☐ | ☐ | ☐ | ☐ |
| Legal pages | ☐ | ☐ | ☐ | ☐ |

---

## 11. State of the current iOS app, measured

Built, run and re-measured on 2026-10-24 (iPhone 17 simulator, `xcodebuild test`,
screenshots from `SuhbaUITests/ScreenshotTests.swift`).

### 11.1 Fixed in this pass

1. **Events decoded again.** `CommunityEvent` expected a singular `category`, while the
   API sends `categories: [String]`, so the whole list threw and the tab showed
   "Etwas ist schiefgelaufen". The model now matches the payload and also carries
   `startPrayer`, `recurrence`, `recurrenceUntil`, `registrationUrl`,
   `requiresRegistration` and `audience`.
2. **Unknown enum values no longer take the response down.** `WORKSHOP` and
   `NEW_MUSLIMS` were missing from `EventCategory`; `decodeLenient*` in `Models.swift`
   now falls back instead of throwing, so the next value the backend invents is a wrong
   chip rather than an empty screen.
3. **Submissions reach the backend.** `EventSubmission` sent `category`; the backend
   field is `categories` and is `@NotEmpty`, so every submitted event failed validation.
4. **German content.** `Dhikr` and `Duaa` carried an `en` field and the app rendered
   English in a German-only product. All four JSON files now hold the web's `de` text.
5. **Addresses stop repeating the district.** `AddressFormatting` ports
   `utils/address.ts`; spot, halal and event views use it.
6. **Halal shows the placeholder**, matching the web decision not to publish unverified
   halal claims. The directory code stays in the file for when the data is ready.
7. **Top bar matches the web**: 56 pt white strip plus status bar, 1 pt divider, the
   countdown inline on the right. iOS 26 otherwise floats it as a glass capsule.
8. **Event card and detail sheet reach parity**: every category as its own chip, the
   recurrence chip, registration and audience chips, prayer-bound start times
   ("nach dem Dhuhr-Gebet"), the full registration link with a copy button, and the
   route button on the card.
9. **Audience filter** added to the events filter sheet, as a second axis next to time
   and category, exactly as the web keeps them.
10. **Submit form** gained recurrence, series end date with the backend's own
    "ends before it starts" guard, the registration toggle with an http(s)-only link,
    and the audience picker in the web's field order.
11. **Corner style** is `.circular` throughout, matching CSS radii.
12. Six Phosphor icons were missing from the asset catalog and are now in it.

### 11.2 Claims that did not survive measurement

Three defects reported from a first read of the screenshots were wrong, and are recorded
here so nobody "fixes" them again:

- **"~200 pt dead header".** Measured from the screenshot pixels, the header was 54 pt
  plus the status bar, i.e. already the web's 56 pt. What actually differed was the
  missing divider and the glass capsule, which is what 11.1.7 addresses.
- **"Content is clipped behind the tab bar".** Scrolling to the end of the events list
  shows the last card and the legal footer in full above the bar. The first screenshot
  was simply taken mid-scroll.
- **"Tab labels diverge from the web".** `nav.orte` is "Gebetsorte", `nav.halal` is
  "Halal Spots" and `nav.azkar` is "Azkar & Duaa" in the web catalog too. The old
  "Orte / Halal / Azkar" names live only in the outdated `frontend/CLAUDE.md`.

### 11.3 Still open

- The submit form takes **one** category; the web takes several.
- The web lets an organiser announce a start as a prayer instead of a clock time
  (`submit.event.startKindLabel`); iOS always asks for a clock time. Reading such events
  works, creating them does not.
- `~0 km` distances in the halal list, now hidden behind the placeholder but still in
  `HalalViewModel`, need a look before the directory goes live.
- The Dhikr card has a "Details" button where the web has an info toggle plus the
  tasbih counter; both work, they are not the same control.
- Map pin colours (`#485530`, `#5A6840`, `#B89A70`) are old cream-era values, but
  `SpotsMap.tsx` uses exactly the same ones. A leftover in both apps: move them together
  or not at all.

Not to be rebuilt, they are already right: colour tokens, radii, the CSS gradient maths
in `CSSLinearGradient`, the line-height helpers, Amiri and Georgia rendering, the
Phosphor asset pipeline, and the spot and business submission forms.
