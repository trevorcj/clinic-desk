# Clinic Desk

An appointment booking and management app. Patients book appointments on `/book` through a multi-step form, and staff will manage appointments on `/appointments`.

## How to run it locally

1. Install dependencies

```bash
npm install
```

2. Run the development server

```bash
npm run dev
```

3. Open [http://localhost:3000/book](http://localhost:3000/book) in your browser to test the booking flow.

4. To check types and code quality:

```bash
npm run build
npm run lint
```

## Folder Structure

- `app/`: Next.js App Router pages and Route Handlers.
  - `app/book/`: The patient booking page (`/book`).
  - `app/api/`: In-memory API handlers for `/api/providers` and `/api/appointments`.
- `components/`: UI and feature components.
  - `components/booking/`: The multi-step form, navigation bar, top progress indicators, and individual step views (patient details, visit details, payment method, review, and confirmation).
  - `components/ui/`: Reusable input and select controls with labels and error styling.
- `lib/`: Business logic, validations, and store.
  - `lib/validations/booking.ts`: Zod validation schemas shared between the client form and the server API.
  - `lib/seed.ts`: Data seeding script using Faker to generate 160 realistic appointments and 6 providers.
  - `lib/store.ts`: Global in-memory store that persists the seeded data and newly booked appointments during development.

## What is done so far

- Multi-Step Booking (`/book`):
  - 4-step form with persistent top progress navigation and bottom actions.
  - Validates every step before moving forward.
  - Going back never loses previously entered data.
  - If a user refreshes the page, their unfinished draft is restored from local storage.
- Validation Rules (Zod):
  - Patient must be 18 or older.
  - US phone formatting (`+1 XXX XXX XXXX`).
  - Clinic hours: Weekdays only, 09:00 to 17:00, on 30-minute intervals.
  - 60-minute visits cannot start at 16:30 because the clinic closes at 17:00.
  - Insurance details are strictly validated only when insurance is selected.
- Mock API & Database Seedin\*:
  - 6 fixed providers loaded from `/api/providers`.
  - 160 initial appointments seeded across past and future dates with realistic statuses (`scheduled`, `checked-in`, `completed`, `cancelled`, `no-show`).
  - When an appointment is booked, it is saved into the in-memory database.
  - 409 Conflict detection if someone attempts to book a slot that is already taken.

## Bonus items

## What is left to build

1. Appointments Table (`/appointments`):
   - Server-side pagination, sorting, and filtering using TanStack Table and TanStack Query.
   - Debounced patient name/email search box.
   - Status filters (multi-select), provider filter, and date range filters.
   - URL-driven state with nuqs so reloading or sharing links restores the exact table view.
2. Appointment Details & Status Transitions (`/appointments/[id]`):
   - Status actions: `scheduled` → `checked-in` → `completed`, etc.
   - Cancellation modal requiring a reason of at least 10 characters.
