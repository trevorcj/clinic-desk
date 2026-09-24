# Decisions

### 1. The last slot of the day

Clinic Desk closes at 17:00. If someone books a 60-minute visit at 16:30, the appointment wouldn't wrap up until 17:30, which is past closing time. Because of that, 16:30 is only available for 30-minute medication visits. For 60-minute visits, the latest time you can book is 16:00. This rule is checked inside `lib/validations/booking.ts`.

### 3. A stale draft

If a patient starts booking and comes back three days later, we don't want them to re-type all their personal and insurance details from scratch. We keep their draft saved in the browser's local storage. If their chosen slot is now in the past, we keep all their details intact, send them to Step 2, and show a red error under the date field asking them to pick a new upcoming time. Once an appointment is booked, we clear the draft.

### 4. Did it save?

If a patient clicks submit, the appointment saves on the server, but a network glitch causes an error, pressing submit again shouldn't create a double booking. Our server checks whether that provider is already booked at that exact time and sends back a 409 Conflict. The form catches that 409 and brings the user back to Step 2 with a message on the time box explaining that the time is already booked.
