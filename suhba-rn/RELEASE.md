# Shipping Suhba to the App Store

Everything here is a step that code cannot take by itself. What code *can* enforce lives
in `npm run check:release`.

---

## 1. Fill in `.env`

One variable:

| Variable | Why it blocks release |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Otherwise the build talks to `http://localhost:8080` and every screen is empty. Must be `https`, or ATS blocks it on device. |

```bash
npm run check:release
```

Nothing else needs a key. The basemap is **MapKit** (Apple Maps) through
`react-native-maps`, and addresses are geocoded by **CLGeocoder** through
`expo-location`. Neither takes an account, a key, or a monthly fee, which is why the
OpenStreetMap tile and Nominatim dependencies were removed rather than paid for.

---

## 2. App Store Connect privacy label — by hand

**`ios/Suhba/PrivacyInfo.xcprivacy` does not do this.** The manifest describes the
bundle; the nutrition label shown on the product page is a separate form Apple will not
let you submit without. Under *App Privacy → Data Types*, declare exactly one:

- **Location → Precise Location**
  - Used for: **App Functionality**
  - Linked to the user's identity: **No**
  - Used for tracking: **No**

Nothing else. The app collects no account, contact, or usage data, and this must agree
with `app.json` → `ios.privacyManifests`, which already declares precisely this.

---

## 3. iPad

`app.json` sets `ios.supportsTablet: false`, so the app runs on iPad in iPhone
compatibility mode and Apple reviews no iPad layout. If that is ever flipped back to
`true`, every screen needs a pass above 402 dp first — none has had one.

---

## 4. Backend must be awake-ish

Reads go through `apiGet` in `src/services/apiFetch.ts`, which retries a sleeping Render
instance four times with a backoff (up to roughly 70 s) before showing an error, and the
error state offers a retry button. That covers a cold start, but a reviewer on a slow
connection still waits. Consider warming the backend, or leaving the free tier, on the
day you submit.

---

## 5. Build

```bash
npm run check:release
npx expo prebuild --platform ios --clean
# then archive from Xcode, or use EAS
```

Node 22.13+ is required; Expo 58 refuses to run on Node 18. If `xcodebuild` complains
about the developer directory, either `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
or set `DEVELOPER_DIR` for the build.

---

## Before Android ever ships

`react-native-maps` renders Apple Maps on iOS with no key. **On Android it renders Google
Maps, which does need an API key** in `app.json` → `android.config.googleMaps.apiKey`,
plus a Google Cloud billing account. Mobile map loads are billed at $0.00 and Google
documents mobile usage of the Maps SDK for Android as unlimited, so the account exists
only to hold the key. Without it the Android map is a blank grey square.
