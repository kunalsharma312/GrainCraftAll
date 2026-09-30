# GrainCraft — Integrations & Configuration Guide

This is the one place to understand:

1. How the app is split into a **simple Phase‑1 shop** and the **full app**
2. Every **third‑party integration**, what it needs, and how to turn it on
3. How to **change the design** without touching screen code

Nothing has been deleted from the codebase. Advanced features are dormant and
controlled by flags — flip a flag to bring them back.

---

## 1. Phases & Feature Flags

All switches live in **`src/config/featureFlags.ts`**.

```ts
featureFlags = {
  SIMPLE_MODE: true,          // master switch — see below

  ENABLE_GOOGLE_AUTH: false,  // Google sign-in
  ENABLE_BIOMETRIC: false,    // Face ID / fingerprint login
  ENABLE_BLENDS: false,       // custom blend builder
  ENABLE_PAYMENT: false,      // in-app payment sheet
  ENABLE_NOTIFICATIONS: false,// push / local notifications
  ENABLE_SHARE: false,        // native share buttons
  ENABLE_HAPTICS: true,       // tap vibration feedback
  ENABLE_ORDER_HISTORY: false,// past orders screen

  ORDER_DELIVERY: 'email',    // 'email' | 'api' | 'console'
}
```

### `SIMPLE_MODE`

| Value | What the app shows |
|-------|--------------------|
| `true` (default) | **Phase 1:** one screen — browse grains, add to a bottom cart, fill address + pincode + mobile, order is emailed to the shop. No login, no payment. |
| `false` | **Full app:** Google auth, tabs (Discover / Blend / Cart / Orders), payment, notifications, biometric login, etc. |

`App.tsx` chooses the screen:

```tsx
{featureFlags.SIMPLE_MODE ? <SimpleHomeScreen /> : <AppNavigator />}
```

> To launch Phase 2, set `SIMPLE_MODE: false` and turn on the individual
> `ENABLE_*` flags you want, then configure their integrations below.

---

## 2. How an order reaches you (Phase 1)

Controlled by `ORDER_DELIVERY` in `featureFlags.ts` and implemented in
**`src/services/orderEmailService.ts`**.

| Mode | What happens | Setup needed |
|------|--------------|--------------|
| `console` | Order is printed to the dev console | None — great for local testing |
| `email` (default) | Order is emailed to the shop owner via **EmailJS** (no backend) | EmailJS account + env vars |
| `api` | Order is `POST`ed to your own backend | A backend endpoint |

If `email`/`api` is selected but not configured, the service **safely falls
back to console** and tells you what's missing — the app never crashes.

---

## 3. Third‑Party Integrations

All secrets are read from environment variables. In Expo, any variable that
starts with `EXPO_PUBLIC_` is available in the app. Put them in a `.env` file at
the project root (see `.env.example`).

### 3.1 EmailJS (Phase‑1 order email) — **cheapest, no backend**

EmailJS sends email directly from the app using a public key. Free tier covers
~200 emails/month.

**Setup**

1. Create a free account at <https://www.emailjs.com>.
2. Add an **Email Service** (e.g. connect a Gmail account) → note the **Service ID**.
3. Create an **Email Template** → note the **Template ID**. Use these variables
   in the template body so the order details show up:

   ```
   Shop: {{shop_name}}
   {{order_summary}}

   Items: {{items}}
   Total: {{total}}
   Address: {{address}}
   Pincode: {{pincode}}
   Mobile: {{mobile}}
   Placed at: {{placed_at}}
   ```

   Set the template "To email" to `{{to_email}}`.
4. From **Account → API Keys**, copy your **Public Key**.

**Env vars**

```env
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
EXPO_PUBLIC_SHOP_OWNER_EMAIL=you@yourshop.com
```

Set `ORDER_DELIVERY: 'email'` (default). Done — orders now land in your inbox.

> Alternatives with the same "no backend" idea: **Web3Forms** or **Formspree**.
> To use one, point `ORDER_DELIVERY` to `'api'` and set `EXPO_PUBLIC_ORDER_API_URL`
> to their form endpoint (their payload shape differs slightly; adjust
> `sendViaApi` in `orderEmailService.ts` if needed).

### 3.2 Your own backend (optional)

```env
EXPO_PUBLIC_ORDER_API_URL=https://api.yourshop.com/orders
```

Set `ORDER_DELIVERY: 'api'`. The full order JSON is POSTed as‑is.

### 3.3 Google Sign‑In (full app only)

Used by `AuthScreen`. Requires OAuth client IDs from Google Cloud Console.

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
```

Turn on with `ENABLE_GOOGLE_AUTH: true` (and `SIMPLE_MODE: false`).

### 3.4 Payments (full app only)

The payment sheet supports a demo mode and is wired for Razorpay/Stripe.

```env
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

Turn on with `ENABLE_PAYMENT: true`. Without a key it stays in demo mode.

### 3.5 Push Notifications (full app only)

Uses `expo-notifications`. Needs a physical device and an Expo project ID.

```env
EXPO_PUBLIC_PROJECT_ID=your-eas-project-id
```

Turn on with `ENABLE_NOTIFICATIONS: true`.

### 3.6 Biometric login, Share, Haptics

No external accounts needed — purely on‑device.
Controlled by `ENABLE_BIOMETRIC`, `ENABLE_SHARE`, `ENABLE_HAPTICS`.

---

## 4. Changing the design

All Phase‑1 look‑and‑feel lives in **`src/config/appConfig.ts`** — edit once,
applies everywhere in `SimpleHomeScreen`.

```ts
appConfig = {
  shopName: 'GrainCraft',
  tagline: 'Fresh stone-milled grains, delivered',
  currencySymbol: '₹',
  phoneCountryCode: '+91',
  phoneLocalDigits: 10,          // required mobile length

  colors: {
    primary, primaryDark, accent,
    background, surface,
    text, textMuted, border,
    success, danger, cartBar,
  },

  layout: { radius, cardRadius, spacing },
}
```

Common tweaks:

| Want to… | Change |
|----------|--------|
| Rename the shop | `shopName`, `tagline` |
| Switch currency | `currencySymbol` (e.g. `$`) |
| Different country phone rule | `phoneCountryCode` + `phoneLocalDigits` |
| Rebrand colors | the `colors` block |
| Rounder / boxier cards | `layout.cardRadius`, `layout.radius` |
| More / less breathing room | `layout.spacing` |

The full app’s deeper theme (typography, component metrics) stays in
`src/assets/theme.json` and `src/theme.ts`.

---

## 5. Editing the grain catalog

Grains shown on the homepage come from the `grains` array in
**`src/assets/mockData.json`**:

```json
{
  "id": "g9",
  "name": "Barley",
  "subtitle": "1 kg • Whole grain",
  "price": 130,
  "image": "https://…"
}
```

Add, remove, or edit entries — the homepage updates automatically. When you
move to a real backend later, swap this array for an API call.

---

## 6. Quick reference — env vars

```env
# Phase-1 order email (EmailJS)
EXPO_PUBLIC_EMAILJS_SERVICE_ID=
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=
EXPO_PUBLIC_SHOP_OWNER_EMAIL=

# Or your own order backend
EXPO_PUBLIC_ORDER_API_URL=

# Full app (Phase 2+)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_RAZORPAY_KEY_ID=
EXPO_PUBLIC_PROJECT_ID=
```

---

## 7. Going from Phase 1 → Phase 2

1. `SIMPLE_MODE: false`
2. Turn on the `ENABLE_*` flags you want.
3. Fill the matching env vars from section 3.
4. Rebuild (`npm start`).

That's it — the full app and all its screens are already in the codebase,
waiting behind the flags.

---

## 8. Product images & credits

Grain/atta photos in `src/assets/mockData.json` are served from **Wikimedia
Commons** using the stable `Special:FilePath` endpoint:

```
https://commons.wikimedia.org/wiki/Special:FilePath/<File name>.jpg?width=500
```

This endpoint always redirects to the file's current image, so links keep
working even if the underlying storage path changes. `?width=500` requests a
lightweight thumbnail suitable for the app cards.

### Files used

| Product | Commons file |
|---------|--------------|
| MP Sharbati wheat | `Wheat flour.jpg` |
| MP Lokwan wheat | `Wheat flour 01.jpg` |
| Punjab wheat | `Wheat close-up.JPG` |
| Rajasthan wheat | `Triticum aestivum grains.jpg` |
| UP wheat | `Wheat and wheat based foods.jpg` |
| Multigrain | `Various grains.jpg` |
| Kuttu / buckwheat | `Buckwheat-groats.jpg` |
| Besan | `Besan.JPG` |
| Bajra | `Pearl millet.jpg` |
| Jowar | `Sorghum.jpg` |
| Ragi | `Finger Millet.JPG` |
| Makki | `Cornmeal.jpg` |
| Rice flour | `Rice flour.jpg` |
| Sooji / rava | `Semolina.jpg` |
| Khapli / emmer | `Emmer.jpg` |

### Licensing note

These Commons files are freely licensed (public domain or Creative Commons such
as CC BY-SA). Public-domain images need no attribution; CC BY / CC BY-SA images
require crediting the author and license. Before going to production:

1. Open each file's page: `https://commons.wikimedia.org/wiki/File:<File name>`
2. Check the exact license and author.
3. For CC BY / BY-SA files, add a credits screen or footer listing
   "Photo by <author>, <license>, via Wikimedia Commons".

To swap in your **own product photos** (recommended for a real shop), just
replace the `image` URL on each item in `mockData.json` with your hosted image
URL. Nothing else needs to change.

> Note: a couple of the exact Commons filenames above should be confirmed on
> Commons — if an image doesn't load, open Commons, search the product name
> (e.g. "sorghum grain"), and paste that file's name into the `Special:FilePath`
> URL. The endpoint pattern stays identical.
