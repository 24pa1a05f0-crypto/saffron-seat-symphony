# Saffron Table — Restaurant Table Reservation System

A full stack web app where customers browse a restaurant menu, check live seat availability and book a table. Staff use an admin dashboard to confirm or cancel bookings.

## Features
- Home, Menu, Register, Login (email/password or Google), Reserve, My Bookings and Admin pages
- Live availability: each 30-minute slot shows how many seats are free
- Server-side checks reject past times, times outside opening hours, over-capacity slots and overlapping bookings by the same customer
- Customers can see and cancel only their own bookings (enforced by database row-level security)
- Admins can view all bookings, filter by date/status, and confirm, cancel or reset them

## Tech stack
- **Frontend:** React 19, TanStack Start/Router, Tailwind CSS v4
- **Backend & database:** Lovable Cloud (PostgreSQL, authentication, row-level security)
- **Build tool:** Vite 7, Bun

## Folder structure
```
src/
  routes/        pages (index, menu, login, register, reserve, bookings, admin)
  components/    layout, auth form, auth guard, UI components
  lib/           restaurant config + menu data (restaurant.ts), auth context (auth.tsx)
  integrations/  generated database / auth clients (do not edit)
  test/          unit tests
supabase/        database migrations
```

## Availability algorithm (assumptions)
- Open daily; bookable start times 12:00–20:30 every 30 minutes (India time)
- 40 seats in total; max 10 guests per online booking; up to 60 days ahead
- Each booking holds its seats for 2 hours. A new booking is accepted only if
  `seats booked in overlapping 2-hour windows + new guests ≤ 40`
- Cancelled bookings free their seats
- Enforced by the `validate_reservation` database trigger; the form only previews it.
  If you change rules, update both `src/lib/restaurant.ts` and the trigger.

## Run locally
Prerequisites: [Bun](https://bun.sh) (or Node.js 20+), Git.

```bash
git clone https://github.com/<your-username>/restaurant-reservation-system.git
cd restaurant-reservation-system
bun install
bun run dev
```
Open http://localhost:8080.

### Environment variables
The `.env` file holds only public (publishable) values:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```
No private secrets are stored in the code.

### Tests
```bash
bunx vitest run
```

## First administrator
The **first account to register** automatically becomes admin (via a database trigger on signup). Everyone after that is a customer. Register your own account first after deploying.

## Deployment
Deployed with Lovable's hosting (free tier): click **Publish** in the editor. Database changes apply automatically; frontend changes go live after clicking **Update** in the publish dialog.

Live URL: _add after publishing_

## Screenshots
_Add screenshots of the home, reserve, bookings and admin pages here._

## Known limitations / future work
- Capacity is counted in seats, not individual tables
- No email notifications when a booking is confirmed
- Menu is edited in code (`src/lib/restaurant.ts`), not from the admin dashboard
