/**
 * In-memory appointment store for the demo build.
 *
 * Requests created in the booking flow are appended here so the tracking and
 * dashboard screens can read them back. Swap for an API client later — the
 * shape already matches `Appointment`.
 */

import { APPOINTMENTS, type Appointment } from "@/data/appointments";

const created: Appointment[] = [];

let counter = 24900;

export function nextAppointmentId(): string {
  counter += 1;
  return `LF-${counter}`;
}

export function addAppointment(appointment: Appointment) {
  created.unshift(appointment);
}

export function allAppointments(): Appointment[] {
  return [...created, ...APPOINTMENTS];
}

export function findAppointment(id: string): Appointment | undefined {
  return allAppointments().find((a) => a.id === id);
}
