# Decisions

### 1. The last slot of the day
The clinic closes at 17:00. A 30-minute visit starting at 16:30 finishes right on time at 17:00, but a 60-minute visit would run until 17:30 after closing. So our time selector only allows 16:30 for 30-minute medication visits, and caps 60-minute visits at 16:00. This is enforced directly in `lib/validations/booking.ts` during form validation and checked on the server.

### 2. Whose 9:00?
The clinic’s operating hours are always fixed to the clinic’s local time zone, `America/New_York` (Eastern Time), from 9:00 AM to 5:00 PM, Monday through Friday. But patients can book from anywhere in the world (like Lagos, London, or Los Angeles). To handle this without confusion, our validation code in `lib/validations/booking.ts` converts the chosen time into New York time using `Intl.DateTimeFormat`. For example, if a patient in Lagos, Nigeria (WAT, UTC+1) chooses 2:00 PM on their computer, the system converts it to 9:00 AM New York time (EDT, UTC-4) and confirms it is within clinic hours. We also show both the Clinic Time (New York) and the patient's Local Time side-by-side on the booking page, the review step, and the confirmation screen. In the database, every appointment is stored as a universal UTC ISO string (`2026-10-05T13:00:00.000Z`), and the front-desk staff dashboard displays everything in New York time so the clinic staff always see appointments matching their office workday.

### 3. A stale draft
If someone starts booking and returns days later, we keep all their personal info and insurance in `localStorage` so they don't have to retype everything. If the date they picked is now in the past or taken, we bring them back to Step 2 and highlight the time field with a clear red message saying that slot is no longer available. Once an appointment is booked successfully, the saved draft is completely removed.

### 4. Did it save?
Because the server simulates network dropouts right after saving, a patient might think their booking failed and press Submit again. To protect against accidental double bookings, the server checks if that provider is already booked at that start time and returns an HTTP 409 Conflict. When the frontend gets a 409, it does not wipe the form; it sends the user back to Step 2 with a clear notice explaining the slot was taken and invites them to pick another time.

### 5. Two clicks, one appointment
While a status change mutation is in flight, we disable all other action buttons and show a loading spinner on the button they clicked. This stops someone from spamming "Check in" and "Cancel" simultaneously. If a mutation fails, our optimistic update automatically rolls the status badge back to what it was before and pops up a black-and-white toast alert telling the staff member the action couldn't be saved.

### 6. Rows that move
When a staff member is browsing page 3, we use TanStack Query's `keepPreviousData` so the table never flashes blank or jerks around while fetching. A newly booked appointment arriving on earlier pages does change total page count, but we do not yank the user back to page 1 automatically while they are reading page 3. The staff member stays exactly on their page, and the data refreshes cleanly whenever they navigate, change filters, or click search.

### 7. Search and the back button
We debounce the search input by 300 milliseconds and update the URL without pushing a new browser history entry for every single keystroke. When someone finishes typing, the URL updates with `replaceState`. That means clicking the browser's Back button takes the user back to their previous page or filter view, rather than stepping back through every single character they typed.

### 8. The deployed store
On serverless platforms like Vercel, serverless functions can spin up in different instances, which could cause a naive in-memory array to lose newly created appointments across invocations. To ensure the live demo works reliably across tabs and serverless calls, our in-memory store is attached to Node's `globalThis`, seeded with 160 appointments, and provides persistent state throughout runtime lifecycles.

### 9. Push back
I would push back on having POST and PATCH mutations return an HTTP 500 error *after* successfully writing to the database without returning an idempotency token or transaction status. In a real-world healthcare system, a client seeing a 500 would assume the booking failed and retry, causing duplicate records or confusion for patients. Instead, the backend should use idempotency keys (`Idempotency-Key` header) or transactional rollbacks so either the write succeeds with a 200, or it rolls back completely and reports the failure.
