# Suhba — React Native

The Suhba PWA rebuilt as a native app, following `docs/react-native/SUHBA_REACT_NATIVE_SPEC.md`.
The web code in `frontend/suhba/` stays the source of truth: where this app and the web
disagree on a number, a colour or a behaviour, the web is right and this app is wrong.

See `RELEASE.md` before any TestFlight or App Store build.

## Running it

A **development build** is required. `react-native-maps` is a native module, so Expo Go cannot run
this app.

```sh
npm install
cp .env.example .env          # point EXPO_PUBLIC_API_BASE_URL at the backend
npm run ios                   # or: npm run android
npm start                     # once a dev build is installed
```

Two prerequisites that bit on this machine:

- CocoaPods is not installed by default. `gem install cocoapods` (rbenv Ruby 3.2 is
  fine) before the first iOS build.
- `xcode-select` may point at the Command Line Tools rather than Xcode. Either
  `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`, or prefix the build
  with `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`.
- Node 20+ is required by Expo SDK 58; the default `node` here is 18.

For Android, the SDK was installed from scratch:

```sh
brew install --cask android-commandlinetools
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
yes | sdkmanager --licenses
sdkmanager --install "platform-tools" "emulator" "platforms;android-36" \
  "build-tools;36.0.0" "system-images;android-36;google_apis;arm64-v8a"
avdmanager create avd -n suhba390 -k "system-images;android-36;google_apis;arm64-v8a"
```

The `suhba390` AVD is deliberately **not** a stock Pixel profile: its
`~/.android/avd/suhba390.avd/config.ini` is set to `1170 x 2532` at density `480`, which
is exactly **390 x 844 dp** — the spec's reference viewport width, so the Android pass
and the browser can be compared at the same width.

`npm run typecheck` runs `tsc --noEmit`. `npm run doctor` runs `expo-doctor`.

## Decisions this port made

- **Map: `react-native-maps`, not MapLibre.** The port started on MapLibre so the
  basemap would match the web's Leaflet-over-OpenStreetMap look. That turned out to be
  unshippable: the OSMF tile usage policy forbids a distributed app pointing at
  `tile.openstreetmap.org`, and every alternative raster host that permits commercial
  use costs $20–30 a month. MapKit on iOS costs nothing and needs no key, so the
  basemap no longer matches the web and that is the accepted trade. Android will need a
  Google Maps key before it ships — see `RELEASE.md`.
- **Pin colours are the brand greens.** `SpotsMap.tsx` on the web still uses `#485530`,
  `#5A6840` and `#B89A70`, which are leftovers from the retired cream palette. They live
  in one place here, `src/features/spots/mapPin.tsx`.
- **No `nativewind`.** Keeping the Tailwind class strings would add a build step and a
  second styling model on top of a port that has to re-examine every layout for RN's flex
  defaults anyway. The classes are translated once into `src/theme/` plus
  `StyleSheet.create`.
- **Georgia italic on iOS, the platform serif on Android.** Android ships no Georgia and
  Android Chrome already falls back to a generic serif today, so this reproduces the web's
  own split rather than bundling a third serif.
- **The prayer widget has a visible error state.** The web renders nothing when the fetch
  fails, so on a cold backend the card is simply absent and the countdown disappears from
  every tab. This is a deliberate improvement over the web, not a copy of it.

## Deliberately not ported

- `services/adminService.ts` and `features/admin/` — `/admin` is a web-only route behind
  a cookie.
- `features/prayers/PrayerTimesPage.tsx`, `PrayerCard`, `ShoroukRow` — nothing in
  `App.tsx` reaches them.
- `features/home/HijriDateBadge.tsx`, and with it `utils/hijriCalendar.ts` — dead code on
  the web too. Spec §8.1 lists `hijriCalendar.ts` and `utils/datetimeLocal.ts` as files
  that port unchanged, but nothing imports either here (the forms use the local-time
  helpers in `features/submit/controls.tsx`), and `getTodayHijri` leans on
  `en-u-ca-islamic-umalqura` — exactly the Intl surface Hermes only partly implements, so
  it would fail silently to a Gregorian date rather than throw. Both were deleted.
- `services/halalService.ts` and `eventService.submitEvent` are also unreferenced, but
  were kept: the services are otherwise byte-identical to the web, and the halal
  directory needs them the day its data is verified.
- `features/halal/HalalPage.tsx`, `HalalBusinessCard.tsx` — `App.tsx` renders the
  placeholder. These are the reference for when the data is verified.
- `data/izw_prayer_times_2026.json` — nothing imports it; the times come from the backend.
- `features/azkar/DailyTipCard.tsx` — spec §7.5 lists a daily tip card on the Azkar
  page, but `AzkarPage.tsx` does not render one and nothing else imports it either. The
  spec has been corrected; wire it into the web page first if the card is wanted.

## What has actually been run

**iOS 26.5 simulator (iPhone 17)** and an **Android 36 emulator at exactly 390 x 844 dp**,
both against the live backend at `suhba-backend.onrender.com`. Every screen renders with
real data on both platforms.

### Side-by-side against the web (spec §10.3) — passed

The web app was served by Vite and screenshotted with Playwright at the reference
viewport, `390 x 664` at `deviceScaleFactor: 3`, `de-AT`, `Europe/Vienna`. The Android
emulator is `1170 x 2532 @ 480 dpi`, which is the same 390 dp at the same 3x, so the two
images compare pixel for pixel. Block heights and positions were measured numerically,
not by eye:

| Block | web | Android | iOS |
|---|---|---|---|
| Prayer widget | 132.0 dp | **132.0** | 133.0 |
| Dhikr card | 219.0 dp | **219.0** | 220.0 |
| Quick grid row | 79.0 dp | **79.0** | 79.3 |
| Quick grid offset | 426.0 dp | **426.0** | — |

Android is exact; iOS is within 1 dp (text-layout rounding). Getting there took three
fixes, each found only by measuring:

- **`ring-2` must not be a border.** CSS draws a ring outside the box at no layout cost;
  an RN `borderWidth` does not, and the transparent 2 dp border that kept the prayer
  columns from jumping made every column 4 dp taller than the web. It is an absolutely
  positioned overlay inset by `-2` now.
- **45 styles were missing their `lineHeight`.** The type scale in spec §1.2 maps
  `text-xs` to 12/16, `text-sm` to 14/20 and so on, but a local `StyleSheet` entry with
  only `fontSize` gets the platform's natural leading instead. `TextInput` styles are
  deliberately exempt: an explicit `lineHeight` there mis-centres the text on Android.
- **Spec §1.2 was wrong about the arbitrary sizes** and has been corrected. See below.

### Android-specific findings

- **`overflow: 'visible'` is load-bearing on the icon slots.** An Android ViewGroup clips
  children to its own bounds by default; iOS does not. The iOS fix for the Arabic in the
  nav bar and the quick grid worked there and silently beheaded the glyphs on Android.
- **The hardware back chain works** (spec §10.6), verified with `adb`: back closes the
  detail sheet, then returns to Start, then leaves the app. `predictiveBackGestureEnabled:
  false` in `app.json` is what keeps `BackHandler` working at all.
- **`android:forceDarkAllowed` was missing.** `userInterfaceStyle: "light"` only pins
  what RN's `useColorScheme()` reads; it does not stop Android's framework-level force
  dark. `plugins/withForceLightTheme.js` adds it. The plugin extends the existing
  `AppTheme` rather than appending a second one — a duplicate `<style>` silently drops
  every item the first one carries, which is the same class of defect as the duplicated
  project key in spec §11.
- The permission-denied banner ("Standort nicht verfügbar — Abstände ab Wien-Mitte") was
  reached by declining the Google location prompt, and renders correctly.

### Defects found by running the app

None of these showed up in a type check or a Metro bundle:

1. **The detail sheet showed only its header.** The body `ScrollView` had `flex: 1`
   inside a container that hugs its content, so it resolved against nothing and collapsed
   to zero height — precisely the failure spec §5.7 warns about. `flexShrink: 1` fixes it.
2. **The iOS `<select>` replacement was a ~250 dp inline wheel.** Two of them filled the
   event form. `SelectField` is now the compact field the spec measures, opening the
   native wheel in a sheet on iOS and a list dialog on Android — what Safari and Chrome
   each do with a `<select>`.
3. **The quick-grid tiles were different heights** and **the nav bar's halal label sat
   lower than the other four**: Amiri's line box is far taller than its font size.
4. **Gradient views with a shadow** logged a performance warning every frame; the shadow
   now sits on an opaque wrapper.
5. The counter's Arabic was right-aligned where the web centres it, and its type did not
   scale with the viewport.

On 3: the web's `leading-none` **cannot be copied literally**. CSS lets a glyph overflow
its line box and RN clips to it, so both a tight `lineHeight` and a fixed-height container
behead the Arabic. It is taken out of layout flow instead, inside a slot that does not clip.

### Intl on Hermes (spec §8.4), measured

`format()` is correct — right zone, right language, right date. Two caveats:

- `formatToParts()` is **wrong for a mixed date-and-time shape** on iOS Hermes: `day` and
  `month` come back as `literal`, and `hour` and `minute` are swapped. It is correct for
  the year/month/day shape, which is the only one the shipped code uses (the
  `/prayer-times/{date}` key). `src/dev/intlSmokeTest.ts` asserts that key explicitly.
- iOS Hermes renders `So. 8. Nov., 18:00` where full ICU renders `So., 8. Nov., 18:00` —
  it drops the comma after the weekday. Cosmetic, visible in the event card's date line.

No `@formatjs` polyfill is needed.

### Corrections made to the spec

- §1.2 listed `text-[10px]`, `text-[11px]` and `text-[13px]` as "leave unset". Tailwind's
  preflight sets `line-height: 1.5` on `html` and those classes set only `font-size`, so
  they inherit it: 15, 16.5 and 19.5 respectively. Verified with `getComputedStyle` in the
  browser.
- §8.4's expected Intl string named `Sa.`; 2026-11-08 is a Sunday.
- §7.5 lists a daily tip card on the Azkar page that `AzkarPage.tsx` does not render.

## Review round

A full review of the tree surfaced eight findings. Six were real and are fixed; two were
checked and did not hold up.

**Fixed:**

1. **The iOS date picker closed after a single wheel nudge.** `@react-native-community/
   datetimepicker` renders an *inline* spinner on iOS with no confirm button, and its
   `onChange` fires with `type: 'set'` on every value change — so committing and closing
   there dismissed the picker on the first movement, one day off. `DateTimeField` now
   uses the same confirm sheet as `SelectField` on iOS; only "Fertig" commits.
2. **The Android datetime flow committed a time nobody chose.** The date step called
   `commit()` before handing over to the time step, so cancelling the time dialog left a
   confirmed-looking default behind. Nothing is committed until the time step resolves —
   verified on the emulator by picking a date and then cancelling.
3. **The spot sheet measured distance from Vienna's centre.** `getSpotById` defaults
   `userPos`, and the by-id endpoint carries no `distanceKm`, so a card reading "~0.6 km"
   opened a sheet reading "~8.4 km". The position is passed in now. (The review called
   this new; it is not — `SpotDetailHero.tsx` on the web renders the same field from the
   same unparameterised call. Fixed here deliberately, and worth fixing on the web too.)
4. **Two independent location fixes per screen, and no caching.** The web passed
   `maximumAge: 60_000` and `timeout: 8000`; neither survived the port, and `SpotsPage`
   mounts two hook instances that could settle on different coordinates. One shared,
   cached, timed-out fix now backs every caller.
5. **`SelectField` silently discarded the wheel value** when dismissed by backdrop or
   hardware back. Both now confirm, matching the Android branch and the "Fertig" button.
6. **A font-loading failure was a permanent spinner.** `useFonts`'s error is surfaced.

**Checked, not changed:**

- `getNextPrayer` compares Vienna prayer times against the device clock. That is real,
  but spec §11 lists it explicitly as a divergence inherited from the web that must not
  be fixed quietly, and it is documented below. (The review's scenario assumed a UTC
  emulator; this one runs `Europe/Vienna`.)
- `DateTimePicker`'s `onChange` is deprecated in favour of `onValueChange`/`onDismiss`.
  The current handler is verified correct on both platforms, so the migration is left as
  a follow-up rather than churning tested code. It logs a dev-only warning.

## Follow-ups, now done

- **`DateTimePicker` migrated to `onValueChange` / `onDismiss`.** The deprecated
  `onChange` encoded "value changed", "dismissed" and "neutral button" in one
  `event.type`, which is what made the iOS bug above easy to write. The two concerns are
  separate callbacks now, and the dev-only deprecation warning is gone.
- **`android:forceDarkAllowed` verified in the built artefact**, not just in
  `expo config --introspect`: after a real `prebuild`, `styles.xml` carries exactly one
  `AppTheme` with all five original items plus the flag, and it appears in the merged
  resources that go into the APK.
- **`SYSTEM_ALERT_WINDOW` no longer ships in release builds.** Expo writes it into the
  generated *main* manifest, so it would have reached the Play listing, where "display
  over other apps" is a sensitive permission. `plugins/withoutOverlayPermission.js`
  strips it from `main` only — Expo's own `app/src/debug/AndroidManifest.xml` declares it
  too and the debug source set outranks main, so the dev client's overlay still works.
  Verified against both merged manifests:

  | | release | debug |
  |---|---|---|
  | `SYSTEM_ALERT_WINDOW` | **absent** | present |

  What remains in release is defensible: the two location permissions, `INTERNET`,
  `ACCESS_NETWORK_STATE` and `ACCESS_WIFI_STATE` (maps), `VIBRATE` (RN core), and
  `READ_`/`WRITE_EXTERNAL_STORAGE` from Expo modules — the latter capped at
  `maxSdkVersion=32`, so inert on Android 13 and up.
- **Small device (spec §10.7): iPhone SE, 375 x 667.** A dedicated simulator was created
  for it, and it found a real bug: at 375 dp the six prayer columns leave 40.5 dp of text
  width and "Maghrib" needs 40.4 in the browser. RN measured a hair wider and wrapped it
  onto a second line, making that one column taller than its neighbours. The web does not
  wrap — every label measures exactly 10 px tall at 375, checked with
  `getBoundingClientRect`. The labels are `numberOfLines={1}` now and use the full column
  width.
- **Android at 1.3x system font size (spec §10.7).** Everything stayed readable, but the
  nav bar broke: "Azkar & Duaa" wrapped to two lines and pushed its icon out of line with
  the other four. Tab labels are `numberOfLines={1}` now, which is what native tab bars
  do; the longest one truncates instead of wrecking the bar.
- **Loading, empty and error states walked through (spec §10.5).** Airplane mode is not
  the way to do this on a debug build — it also severs `adb reverse`, so the bundle never
  loads and you are looking at a Metro error, not the app. Pointing
  `EXPO_PUBLIC_API_BASE_URL` at an unreachable host exercises the real paths. That turned
  up one defect: the prayer widget printed `error.message` — *"fetch failed: A server
  with the specified hostname could not be found"*, an English developer string in an app
  that only speaks German. It shows `t('prayers.error')` now and logs the detail in dev.

## Still open

- **The numeric side-by-side covers the home screen**, at both 390 dp (Android vs web)
  and 375 dp (iPhone SE vs web). The other screens were checked visually on both
  platforms but not measured.
- **No large phone pass.** Spec §10.7 also asks for a large device; the layout is
  width-driven and untested above 402 dp. iPad is out of scope on purpose:
  `ios.supportsTablet` is `false`.
- The Android emulator died once while toggling airplane mode. If the app ever has to
  cope with a real connectivity drop mid-session, that path is still untested.

## Known divergences inherited from the web

Fixing these changes behaviour in both apps, so they are left alone on purpose:

- `getNextPrayer` compares Vienna clock strings against the **device** clock. In Vienna
  they agree; abroad the countdown is wrong in the web app too.
- `useSubmitEvent` converts the form's wall-clock input through the **device** time zone
  when building the UTC instant.
- `Tooltip` is hover-only, so the amenity labels are already invisible on every touch
  device, including mobile Safari. The icons stand alone here.
