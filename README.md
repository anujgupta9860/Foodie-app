# Foodie — Peer-to-Peer Homemade Food Marketplace

One codebase, two apps. **Foodie** lets home cooks sell food to neighbors and
customers order homemade meals nearby — no restaurants involved. Built with
**Expo + React Native + TypeScript**, so the same code runs on **iOS** and
**Android**.

> **Try it now:** open `demo/index.html` in any browser for a clickable
> interactive demo of all 22 screens — customer ordering (cart, checkout,
> orders, ratings) and the food-maker flow (dashboard, add dish, accept /
> reject orders, earnings) all work end to end with sample data.

> **Backend API:** `backend/` — runnable Express + TypeScript + Prisma API
> (SQLite dev, Postgres-ready) covering auth, dishes, kitchens, orders,
> reviews, follows, maker dashboard/earnings, and admin. See
> `backend/README.md` — `npm run dev`, then `./scripts/smoke.sh`.
> Full contract in `backend/openapi.yaml`.

## What's inside

**Customer flow** (role → sign-in → location → app)
- `app/index.tsx` — Splash screen
- `app/role.tsx` — Choose role (Customer / Food Maker)
- `app/sign-in.tsx` — Apple / Google / Email sign-in
- `app/location.tsx` — Set location + search radius
- `app/home.tsx` — Home: search, hero banner, categories, today's specials
- `app/search.tsx` — Search dishes
- `app/food/[id].tsx` — Dish detail + add to cart
- `app/cook/[id].tsx` — Cook profile + follow
- `app/cart.tsx` — Cart
- `app/checkout.tsx` — Pickup + payment method + pay
- `app/confirmation.tsx` — Order confirmation
- `app/orders.tsx` — Active / past orders
- `app/review/[orderId].tsx` — Rate food quality, packaging, accuracy
- `app/profile.tsx` — Profile + settings

**Food maker flow**
- `app/maker-onboarding.tsx`, `app/maker-create-profile.tsx`, `app/maker-verification.tsx`
- `app/maker-dashboard.tsx` — Sales stats, today's menu, sold progress
- `app/maker-add-food.tsx` — List a new dish
- `app/maker-orders.tsx` — Accept / reject incoming orders
- `app/maker-earnings.tsx` — Earnings, commission, payout chart
- `app/maker-profile.tsx` — Public kitchen profile

**Admin panel** — `admin/index.html` is a standalone responsive web dashboard
(Dashboard, Users, Orders & Payments, Commission, Reports, Categories). Open it
directly in a browser; in production this becomes a real web app.

**Shared** — `src/theme.ts` (design tokens), `src/data.ts` (types + seed data used as
offline fallback), `src/api.ts` (typed client for the backend API), `src/store.tsx`
(global state backed by the real API: auth, catalog, cart, orders, maker menu),
`src/components/ui.tsx`
(buttons, cards, tab bar, stars, etc.).

> The app talks to the real backend API (`backend/`). If the API is unreachable,
> it falls back to the bundled seed data so screens still render.

## Run it

Prerequisites: Node 18+, and the **Expo Go** app on your phone.

**1. Start the backend** (in one terminal):

```bash
cd foodie-app/backend
npm install
npm run dev        # API on http://localhost:4000
```

**2. Start the app** (in another terminal):

```bash
cd foodie-app
npm install
npx expo start
```

The app reads the API address from `EXPO_PUBLIC_API_URL` (default
`http://localhost:4000`). On a **physical phone**, `localhost` is the phone
itself — point it at your computer's LAN IP instead:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.5:4000 npx expo start
```

Demo logins (password `password123`):
- Customer — `customer@foodie.demo`
- Maker — `maker@foodie.demo`
- Admin — `admin@foodie.demo`

Then:
- **Phone** — scan the QR code with Expo Go (iOS Camera / Android Expo Go app).
- **iOS simulator** — press `i` (needs Xcode on a Mac).
- **Android emulator** — press `a` (needs Android Studio).
- **Web preview** — press `w`.

Typecheck: `npx tsc --noEmit`

## Ship to the App Store / Play Store

Build config is ready in `eas.json` (development / preview / production
profiles). One-time setup, then build:

```bash
npm install -g eas-cli
eas login                        # your Expo account
eas init                         # links the project, adds the EAS projectId to app.json
```

```bash
# Point the build at your publicly reachable API (baked in at build time):
EXPO_PUBLIC_API_URL=https://api.your-domain.com eas build -p ios --profile production
EXPO_PUBLIC_API_URL=https://api.your-domain.com eas build -p android --profile production
eas submit -p ios                # submit to App Store Connect
eas submit -p android             # submit to Play Console
```

Notes:
- The iOS production build needs an Apple Developer account ($99/yr) and goes
  through App Store review; Android needs a Play Console account ($25 once).
- For quick device testing without the stores, use the `preview` profile —
  it produces an installable APK (Android) / simulator build (iOS).
- `localhost` never works in a store build — the API must be deployed to a
  public URL first (the backend is Postgres-ready; see `backend/README.md`).

## Roadmap to production

1. **Backend** — ~~swap `src/store.tsx` mock state for API calls~~ ✅ done
   (`src/api.ts` + `src/store.tsx` talk to `backend/`; JWT in SecureStore).
   Remaining: Postgres for prod, realtime order updates (websockets/push).
2. **Payments** — Stripe Connect (marketplace payouts to cooks, 10% commission).
3. **Maps & location** — `expo-location` + Google Places for real radius search.
4. **Push notifications** — `expo-notifications` for order updates.
5. **Verification** — ID check (Stripe Identity) + food-safety agreement flow.
6. **Admin** — rebuild `admin/` as a Next.js app on the same backend.

Food images currently use placeholder photos (`picsum.photos`) — replace with
cook-uploaded photos via `expo-image-picker` + storage bucket.
