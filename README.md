# Clinic Desk

An appointment booking and management application built with Next.js App Router.

- Patients book appointments through a validated 4-step wizard on `/book`.
- Front-desk staff manage appointments on `/appointments` using a searchable, filterable, server-paginated data table with optimistic status transitions and deep links.

## How to run it locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open your browser:
   - Patient Booking Wizard: [http://localhost:3000/book](http://localhost:3000/book)
   - Staff Appointments Management: [http://localhost:3000/appointments](http://localhost:3000/appointments)

4. Verify types and code quality:
   ```bash
   npm run build
   npm run lint
   ```

## Folder structure and why

```bash
├── app/
│   ├── api/
│   │   ├── appointments/          # REST endpoints for paginated list, CSV export, and creation
│   │   │   └── [id]/              # Single appointment retrieval and PATCH status updates
│   │   └── providers/             # Lists active clinic doctors and specialties
│   ├── appointments/              # Staff management routes
│   │   ├── page.tsx               # Appointments list view
│   │   ├── layout.tsx             # Staff navigation, header search bar, failure toggle
│   │   └── [id]/                  # Deep-link standalone appointment view
│   ├── book/                      # Patient multi-step booking wizard
│   ├── context/                   # Failure simulation and toast notification providers
│   ├── services/                  # Client-side API fetchers
│   └── not-found.tsx              # Clean 404 page for unknown routes or IDs
├── components/
│   ├── appointments/              # Table, detail panel, cancel modal, and dashboard layout
│   ├── booking/                   # Step-by-step form wizards, review, and confirmation screens
│   └── ui/                        # Reusable form inputs and error alerts
├── lib/
│   ├── seed.ts                    # Faker generator creating 160 realistic appointments
│   ├── store.ts                   # In-memory database attached to globalThis
│   ├── exportCsv.ts               # Filter-aware CSV exporter and file downloader
│   ├── types/                     # Shared TypeScript data models
│   └── validations/               # Zod validation schemas shared by frontend and backend
├── DECISIONS.md                   # Explanations for the 9 architectural trade-offs
└── README.md                      # Project documentation and guide
```

### Why this structure?

- Separation of concerns: UI components are separated by feature domain (`booking` vs `appointments`), keeping files focused and easy to maintain.
- Shared validation: Zod schemas in `lib/validations` are reused across both client-side React Hook Form validation and server-side Next.js route handlers.
- Single source of truth: The in-memory database in `lib/store.ts` serves both patient booking and staff management simultaneously.

## What was built

### 1. Patient Booking Wizard (`/book`)

- 4-Step progressive form: Patient info, visit scheduling, payment method, and summary review.
- Strict validation: Requires 18+ age verification, valid US phone formatting, weekday-only appointments between 09:00 and 17:00, and conditional insurance requirement.
- Draft persistence: If a patient refreshes the page or comes back later, their unfinished form draft is restored from `localStorage`.
- 409 conflict redirection: If a slot is booked by someone else in the meantime, the user is politely returned to Step 2 with an error message without wiping their personal info.

### 2. Staff appointments management (`/appointments`)

- TanStack Table & TanStack Query: Server-side pagination, sorting (by date and patient name), debounced search (by patient name or email), and multi-criteria filters (status, provider, visit type).
- Synchronized URL state (`nuqs`): Every filter, search term, sort order, and page number lives in the URL. Sharing links or using browser back/forward buttons restores the exact view.
- Smooth page transitions: `keepPreviousData` keeps the existing rows visible with a subtle indicator while the next page loads, preventing empty screen flashes.
- Dual presentation: Responsive design showing a drawer on desktop and an accessible modal on mobile/tablet screens.
- Status lifecycle transitions: Enforces valid transitions (`scheduled` → `checked-in` → `completed`, `no-show`, and `cancelled`).
- Cancellation modal: Requires a cancellation reason of at least 10 characters before cancellation is allowed.
- Failure simulation toggle: An in-app switch in the header adds the `x-simulate-failure: 1` header to simulate real-world 500 errors and test error handling.

## Bonus Items Attempted

1. Optimistic status updates with rollback and toast:

   Status updates apply instantly in the UI. If the server fails (or failure simulation is on), the UI automatically rolls back to the previous state and displays a toast alert.

2. CSV export of current filtered view:

   Staff can click "Export CSV" to download an Excel/spreadsheet-compatible CSV containing all matching appointments across all pages, matching active search and filter criteria.

3. Timezones (`America/New_York`):

   Clinic hours and appointments are consistently anchored to `America/New_York` (EDT/EST) using native `Intl.DateTimeFormat` so patients across different time zones see accurate clinic schedules.

## What is unfinished & what I would do next with another day

- Vitest unit and integration tests: Add automated Vitest tests for the booking schema edge cases (e.g. 16:30 duration limits, age calculation) and React Testing Library tests for table interactions.
- Persistent database (PostgreSQL/Prisma): Replace the in-memory array with Supabase or Prisma to persist data across cold starts and deployments permanently.
- Dark mode.
- Live provider slot endpoint: Add a dedicated endpoint returning dynamic real-time slot availability per doctor.

## Roughly How Many Hours Spent

- Total Time: Approximately 24 to 28 hours total across planning, multi-step booking wizard with validation, mock database seeding, TanStack table implementation, optimistic updates, and responsive refinements.
