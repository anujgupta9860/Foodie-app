# Foodie Backend API

Express + TypeScript + Prisma API for the **Foodie** peer-to-peer homemade-food
marketplace. Customers browse home kitchens, place pickup orders, and leave
reviews; food makers manage their kitchen, menu, orders, and earnings; admins
oversee users, orders, payouts, and kitchen verification.

Money is stored as integer **cents**. Auth is JWT (`Authorization: Bearer <token>`).

## Quickstart

```bash
cd backend
npm install          # also runs `prisma generate` via postinstall
cp .env.example .env # set JWT_SECRET to a long random string
npx prisma migrate dev --name init
npm run seed         # demo users, 4 kitchens, 10 dishes, 2 orders, 1 review
npm run dev          # http://localhost:4000 (tsx watch)
```

Demo logins (password for all is `password123`):

| Email | Role |
|---|---|
| `customer@foodie.demo` | CUSTOMER |
| `maker@foodie.demo` | MAKER (owns Priya's Kitchen) |
| `admin@foodie.demo` | ADMIN |

Other maker accounts: `maria.maker@foodie.demo`, `tony.maker@foodie.demo`,
`lin.maker@foodie.demo`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch src/server.ts`) |
| `npm run build` | Type-check + compile to `dist/` |
| `npm start` | Run the compiled server (`node dist/server.js`) |
| `npm run seed` | Seed demo data (`tsx prisma/seed.ts`, re-runnable) |
| `npm run migrate` | `prisma migrate dev` (create/apply migrations) |
| `./scripts/smoke.sh` | End-to-end curl smoke test against a running server |

## Curl examples

```bash
# Health
curl localhost:4000/health

# Sign up + log in
curl -X POST localhost:4000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sam","email":"sam@test.dev","password":"password123","role":"CUSTOMER"}'

TOKEN=$(curl -s -X POST localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sam@test.dev","password":"password123"}' | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).token)")

# Browse dishes
curl 'localhost:4000/api/dishes?category=indian&limit=5'

# Place an order (single kitchen per order — one pickup spot)
curl -X POST localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"items":[{"dishId":"chicken-biryani","qty":2}],"paymentMethod":"Apple Pay","pickupSlot":"5:00 PM - 7:00 PM"}'

# My orders
curl -H "Authorization: Bearer $TOKEN" localhost:4000/api/orders/mine

# Follow a kitchen
curl -X POST -H "Authorization: Bearer $TOKEN" localhost:4000/api/kitchens/priya/follow

# Maker: accept an order, check earnings
MAKER=$(curl -s -X POST localhost:4000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"maker@foodie.demo","password":"password123"}' | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).token)")
curl -H "Authorization: Bearer $MAKER" 'localhost:4000/api/maker/orders?status=NEW'
curl -X PATCH -H "Authorization: Bearer $MAKER" -H 'Content-Type: application/json' \
  -d '{"action":"accept"}' localhost:4000/api/maker/orders/FD123456
curl -H "Authorization: Bearer $MAKER" localhost:4000/api/maker/earnings
```

Full endpoint reference: [`openapi.yaml`](./openapi.yaml).

## Connecting the Expo app

Point the mobile app at the API with an env var:

```bash
# in ~/workspace/foodie-app
EXPO_PUBLIC_API_URL=http://localhost:4000/api npx expo start
```

(Use your machine's LAN IP instead of `localhost` for a physical device, e.g.
`EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api`.)

Then replace the mocked store (`src/store.tsx`) with fetch calls, e.g.:

```ts
const API = process.env.EXPO_PUBLIC_API_URL!;
const res = await fetch(`${API}/dishes?category=indian`);
const { data } = await res.json();
```

Send the JWT on protected calls:

```ts
fetch(`${API}/orders/mine`, { headers: { Authorization: `Bearer ${token}` } });
```

Prices come back in cents — divide by 100 for display. Dish `tags` is a
comma-separated string — split on `", "`.

## Switching to Postgres

1. In `prisma/schema.prisma`, change the datasource to:
   `provider = "postgresql"`
2. Set `DATABASE_URL="postgresql://user:password@host:5432/foodie"` in `.env`
3. Run `npx prisma migrate dev --name init` and `npm run seed`

No model changes are needed — the schema is provider-agnostic.

## Stripe Connect next steps

Payments are **stubbed** (`src/stripe.ts`) — `createPaymentIntent()` returns a
mocked object so the full order flow works locally with no keys. Before
handling real money:

1. `npm install stripe`, set `STRIPE_SECRET_KEY` in `.env`
2. Onboard makers with Express accounts: `stripe.accounts.create({ type: 'express' })`
   + onboarding link; store the account id on `Kitchen` (add `stripeAccountId`)
3. Charge with destination fees:
   `stripe.paymentIntents.create({ amount, currency: 'usd', transfer_data: { destination }, application_fee_amount })`
4. Add `POST /api/webhooks/stripe` verifying the Stripe signature header; mark
   orders paid and generate `Payout` rows there
5. Replace the mock in `src/stripe.ts` (each function has a TODO marking the swap)

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma   # User, Kitchen, Dish, Order, OrderItem, Review, Follow, Payout
│   └── seed.ts         # demo data (tsx)
├── src/
│   ├── server.ts       # bootstrap (dotenv + listen)
│   ├── app.ts          # express app + route mounting
│   ├── prisma.ts       # PrismaClient singleton
│   ├── stripe.ts       # STUBBED Stripe Connect integration
│   ├── middleware/
│   │   ├── auth.ts         # requireAuth (Bearer JWT), requireRole(...)
│   │   ├── errorHandler.ts # AppError, 404, zod → 400
│   │   └── validate.ts     # zod body/query/params wrappers
│   └── routes/
│       ├── auth.ts     # POST /api/auth/signup, /login
│       ├── dishes.ts   # GET /api/dishes, /api/dishes/:id
│       ├── kitchens.ts # GET profile/menu, POST/DELETE follow
│       ├── orders.ts   # POST (transactional), /mine, /:id, /:id/review
│       ├── maker.ts    # kitchen/dish CRUD, orders accept|reject, earnings, dashboard
│       ├── admin.ts    # stats, users, orders, payouts, kitchen verification
│       └── health.ts   # GET /health
├── scripts/smoke.sh    # curl end-to-end test
├── openapi.yaml        # OpenAPI 3.1 for every endpoint
└── .env.example
```

## Notes / assumptions

- One order = one kitchen (a single pickup spot). Mixed-kitchen carts are
  rejected with 400.
- Rejecting a maker order restores the dishes' `quantityLeft`.
- One review per order; reviewing a completed order updates the kitchen's
  rolling average rating.
- One kitchen per maker account.
- `followerCount` is a cached counter maintained on follow/unfollow.
- Order ids are human-readable (`FD123456`); generated server-side with a
  uniqueness check.

## Troubleshooting

- **SQLite has no native enums.** Roles and statuses are stored as plain
  strings; the type-safe const enums live in `src/enums.ts`. If you switch
  the provider to `postgresql`, you can restore native Prisma enums without
  touching route code.
- **Restricted networks / proxies:** if `prisma generate` or `prisma migrate`
  fails downloading engines (TLS/proxy errors), download them with curl and
  place them manually, then re-run:
  ```bash
  H="605197351a3c8bdd595af2d2a9bc3025bca48ea2/debian-openssl-3.0.x"
  B="https://binaries.prisma.sh/all_commits/$H"
  curl -o qe.gz "$B/libquery_engine.so.node.gz"
  curl -o se.gz "$B/schema-engine.gz"
  gunzip -c qe.gz > node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node
  gunzip -c se.gz > node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x
  cp node_modules/@prisma/engines/*debian-openssl-3.0.x* node_modules/prisma/
  chmod +x node_modules/@prisma/engines/* node_modules/prisma/*debian-openssl-3.0.x*
  ```
  (Replace the hash with your Prisma version's engine hash if you upgrade.)
