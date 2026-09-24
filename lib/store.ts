import { Appointment, Provider } from "./types/appointment";
import { initialProviders, generateSeedAppointments } from "./seed";

declare global {
  var __clinicDeskStore:
    | {
        providers: Provider[];
        appointments: Appointment[];
      }
    | undefined;
}

if (!global.__clinicDeskStore) {
  global.__clinicDeskStore = {
    providers: initialProviders,
    appointments: generateSeedAppointments(160),
  };
}

export const store = global.__clinicDeskStore;

export async function simulateLatency(min = 300, max = 900) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
