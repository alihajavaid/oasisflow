# OasisFlow Water Delivery — Full Platform

A complete rebuild of the OasisFlow website plus an e-commerce storefront, customer
portal, admin back-office, and a driver app with route optimization and coupon
redemption. Built with Next.js 16 (App Router), Prisma 7 + MySQL, and Leaflet/OpenStreetMap.

## Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **Database:** MySQL via Prisma 7 (`@prisma/adapter-mariadb`, works with MySQL or MariaDB)
- **Auth:** Custom email/password auth with httpOnly JWT session cookies (`jose` + `bcryptjs`) — three roles: `ADMIN`, `DRIVER`, `CUSTOMER`
- **Maps/Routing:** Leaflet + OpenStreetMap tiles (free, no API key), nearest-neighbor + 2-opt route optimizer in `src/lib/routeOptimizer.ts`
- **State:** Zustand for the client-side cart
- **Styling:** Tailwind CSS v4

## First-time setup

Pick **one** way to get a MySQL database, then run the same migrate/seed/dev commands for all of them.

### Option A — Docker Desktop (local MySQL)
```bash
docker compose up -d
```
This starts MySQL 8.4 on `localhost:3306` with the credentials already in `.env.example`.

### Option B — A free-forever hosted MySQL (no Docker, no local install)
There is no MySQL host with an indefinite free tier that's also production-grade (PlanetScale ended its free Hobby tier in 2024). The realistic free-forever option is **db4free.net**: sign up at https://www.db4free.net, create a database, and it's free with no time limit — but it's explicitly a test/dev service (can be slow, data may occasionally be wiped, ~200MB cap). That's a fine match for a demo of this app; don't depend on it for a real production deployment.

Once you have a database, copy the connection string into `.env`:
```
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"
```

> If you'd rather use a free-forever **Postgres** instead (Neon/Supabase are more reliable for always-on use), say so and the schema/adapter can be switched back — it's a small change since nothing Postgres-specific was used.

### Then, regardless of which database you picked:

1. **Install dependencies** (already done if you received this repo as-is):
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` if you haven't already, and set `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```
   Generate a real `AUTH_SECRET` (e.g. `openssl rand -base64 32`) before going to production.

3. **Run migrations and seed demo data**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Demo logins (created by the seed script)

| Role     | Email                                                                          | Password     |
|----------|---------------------------------------------------------------------------------|---------------|
| Admin    | admin@oasisflowwater.com                                                        | Admin123!     |
| Driver   | driver1@oasisflowwater.com, driver2@…, driver3@…, driver4@oasisflowwater.com    | Driver123!    |
| Customer | customer@example.com, khalid@, mariam@, hassan@, layla@, yusuf@example.com      | Customer123!  |

Drivers cover multiple areas each (e.g. driver1 = Mussafah + Khalifa City). The seed also creates a day of
completed deliveries (yesterday), an in-progress route for today with one stop mid-delivery (to demo the timer),
10 days of attendance history, and last-month-paid / this-month-pending payroll for every driver.

## How the pieces fit together

- **Public site** (`src/app/(site)`): Home, Products, Coupon Books, About, Contact, Cart, Login/Register — all using the live imagery/copy from oasisflowwater.com, editable from Admin → Website Content.
- **Customer account** (`/account`): coupon book balances with individual coupon codes, order history, delivery-schedule requests (pay-per-bottle or redeem from a coupon book), feedback. When a driver redeems a coupon or ticks "cash received," the customer's balance/order status updates immediately.
- **Admin** (`/admin`): CMS text editor, products, coupon book types, orders, customers, feedback/contact inbox, delivery areas, driver accounts with **multi-area assignment** (one driver can cover several areas), **attendance** (mark present/absent/leave per day), route dispatch with automatic stop-order optimization across all selected stops regardless of area, inventory, expenses/revenue, and driver payroll.
- **Driver app** (`/driver`): tabbed into:
  - **My Deliveries** — today's assigned route(s) on an OpenStreetMap view with the optimized stop order. Each stop: **Start Delivery** (begins a live elapsed-time clock and flips the stop to "out for delivery"), a **Go to Map / Navigate** button that opens Google Maps turn-by-turn directions to that address, then **Mark Delivered (Done)** — which either asks for the exact number of coupon codes (validated: must belong to that customer's book and be unused, rejecting reuse) or a **cash received** checkbox + amount for pay-on-delivery stops. Delivering also decrements bottle inventory and, for cash orders, marks the order `PAID`.
  - **Route Map** — combines every pending/scheduled stop across *all* of the driver's assigned areas into one shortest-path view from the depot (not just one area at a time).
  - **Attendance** — read-only history of days marked present/absent/leave by admin.
  - **Salary** — base salary plus payslip history showing whether each period is `Paid` or `Pending`.

## Known simplifications (clearly flagged, not hidden)

- **Geocoding:** there's no Google/Mapbox geocoding key configured, so addresses are mapped to a deterministic pseudo-location near the depot (`src/lib/geo.ts`) instead of a real geocoded point. Swap in a real geocoder before going live if you need accurate pinpoints.
- **Payments:** checkout is "cash on delivery" — there's no payment gateway wired in. Admin marks orders `PAID` once payment is collected.
- **Route optimization** uses Haversine straight-line distance (nearest-neighbor + 2-opt), not real road routing. It's a good approximation for stop ordering; for turn-by-turn driving directions you'd add a routing API (e.g. OSRM, Google Directions).
- **Free MySQL hosting:** see the note under Option B above — db4free.net is free forever but dev/test-grade, not a production guarantee.
- This build was produced and typechecked/`next build`-verified against a real local MySQL instance (XAMPP), including a full migrate + seed + smoke test, but only over `curl`/script checks — click through the driver "Start Delivery → Go to Map → Mark Delivered" flow and the admin attendance/route screens in a browser once yourself to confirm the UI looks right.
