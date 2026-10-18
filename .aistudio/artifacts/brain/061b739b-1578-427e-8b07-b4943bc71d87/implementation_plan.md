# Admin Controls for Adsterra Floating Ads & Banner Ads Plan

Add Admin Panel toggles to independently enable or disable Adsterra Social Bar (floating ads that stay on screen) and Native/Banner Ads.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed wanting individual toggle switches in the Admin Panel so they can turn off the floating Social Bar ad while keeping banner ads active, or control both as needed.

- **Confirmed Decision**: Add `adsterraSocialBarEnabled` (Social Bar Floating Ad) and `adsterraBannerEnabled` (Banner Ad) toggle controls under Admin Settings, defaulting `adsterraSocialBarEnabled` to OFF and `adsterraBannerEnabled` to ON.

---

## 1. Overview & Core Concept

- **Goal**: Provide the admin full control over ad displays, allowing the floating Social Bar ad (`a2e3968480a6be43605303c400845909.js`) to be turned off while keeping native banner ads (`invoke.js` container) or Monetag running.
- **User Impact**: Resolves intrusive floating overlay ads on the user screen while retaining monetization flexibility.

---

## 2. Technical Architecture & Component Changes

```
┌────────────────────────────────────────────────────────┐
│                   Admin Panel Settings                 │
│ ┌────────────────────────────────────────────────────┐ │
│ │  • Toggle: Social Bar (Floating Ad) [ON / OFF]    │ │
│ │  • Toggle: Native Banner Ads [ON / OFF]           │ │
│ └────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────┘
                           │ Saved to Firestore: settings/site
                           ▼
┌────────────────────────────────────────────────────────┐
│                 src/components/AdsterraAds.tsx         │
│ ┌────────────────────────────────────────────────────┐ │
│ │  Check siteSettings:                              │ │
│ │  - If socialBarEnabled -> Load Social Bar script   │ │
│ │  - If bannerEnabled    -> Render Banner Container  │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Planned Steps:
1. **Site Settings Schema Update (`src/components/AuthProvider.tsx`)**:
   - Add `adsterraSocialBarEnabled` (boolean, default `false`).
   - Add `adsterraBannerEnabled` (boolean, default `true`).
2. **Admin Panel UI Update (`src/pages/Admin.tsx`)**:
   - In Settings tab, add toggle switches for:
     - **Social Bar (ভাসমান সোশ্যাল বার অ্যাড)**: Default OFF.
     - **Native Banner Ads (নেটিভ ব্যানার অ্যাড)**: Default ON.
   - Save preferences to `doc(db, "settings", "site")`.
3. **Adsterra Component (`src/components/AdsterraAds.tsx`)**:
   - Mount `<AdsterraAds />` in `App.tsx`.
   - Read `siteSettings` from `useAuth()`.
   - Only load `a2e3968480a6be43605303c400845909.js` when `adsterraSocialBarEnabled === true`.
   - Only render `#container-414a5d86b5f07cccbde13ae727340b02` and load `invoke.js` when `adsterraBannerEnabled === true`.
4. **Verification**:
   - Run `compile_applet` and `lint_applet` to verify clean build.

---

## 3. Verification Plan

- Run `compile_applet` to verify clean compilation.
- Run `lint_applet` to verify syntax and imports.
