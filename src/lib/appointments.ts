/**
 * Appointments with an agent (demandes F39 & F40). DB-free view types and
 * guards shared by the public booking flow and the dashboard.
 */

export const appointmentStatuses = [
  'booked',
  'cancelled',
  'completed',
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export function isAppointmentStatus(
  value: unknown,
): value is AppointmentStatus {
  return (
    typeof value === 'string' &&
    (appointmentStatuses as readonly string[]).includes(value)
  );
}

export type AppointmentSlotView = {
  id: string;
  service: string;
  /** ISO timestamp. */
  startsAt: string;
  durationMinutes: number;
  agentName: string | null;
  location: string | null;
  capacity: number;
  bookedCount: number;
  remaining: number;
};

export type AppointmentView = {
  id: string;
  reference: string;
  userId: string | null;
  service: string;
  slotId: string;
  startsAt: string;
  durationMinutes: number;
  agentName: string | null;
  location: string | null;
  name: string;
  email: string;
  phone: string | null;
  reason: string;
  status: AppointmentStatus;
  reminderSentAt: string | null;
  createdAt: string;
};

export function isSlotBookable(slot: AppointmentSlotView, now = new Date()) {
  return (
    slot.remaining > 0 && new Date(slot.startsAt).getTime() > now.getTime()
  );
}

export function isAppointmentUpcoming(
  appointment: AppointmentView,
  now = new Date(),
) {
  return (
    appointment.status === 'booked' &&
    new Date(appointment.startsAt).getTime() > now.getTime()
  );
}

/**
 * Upcoming appointments inside a reminder window (demande F40). Kept out of
 * components so the clock read is not treated as an impure render call.
 */
export function getUpcomingWithin(
  appointments: AppointmentView[],
  withinMs = 72 * 60 * 60 * 1000,
) {
  const now = new Date();
  const limit = now.getTime() + withinMs;

  return appointments.filter((appointment) => {
    const startsAt = new Date(appointment.startsAt).getTime();
    return (
      appointment.status === 'booked' &&
      startsAt > now.getTime() &&
      startsAt <= limit
    );
  });
}
