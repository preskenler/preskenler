import type { Appointment, AppointmentSlot } from '@/generated/prisma/client';

import {
  isAppointmentStatus,
  type AppointmentSlotView,
  type AppointmentStatus,
  type AppointmentView,
} from '@/lib/appointments';
import { prisma } from '@/lib/prisma';
import { generateReference } from '@/lib/reference';

type AppointmentWithSlot = Appointment & { slot: AppointmentSlot };

function toSlotView(
  slot: AppointmentSlot,
  bookedCount: number,
): AppointmentSlotView {
  return {
    id: slot.id,
    service: slot.service,
    startsAt: slot.startsAt.toISOString(),
    durationMinutes: slot.durationMinutes,
    agentName: slot.agentName,
    location: slot.location,
    capacity: slot.capacity,
    bookedCount,
    remaining: Math.max(slot.capacity - bookedCount, 0),
  };
}

function toAppointmentView(appointment: AppointmentWithSlot): AppointmentView {
  const status: AppointmentStatus = isAppointmentStatus(appointment.status)
    ? appointment.status
    : 'booked';

  return {
    id: appointment.id,
    reference: appointment.reference,
    userId: appointment.userId,
    service: appointment.slot.service,
    slotId: appointment.slotId,
    startsAt: appointment.slot.startsAt.toISOString(),
    durationMinutes: appointment.slot.durationMinutes,
    agentName: appointment.slot.agentName,
    location: appointment.slot.location,
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    reason: appointment.reason,
    status,
    reminderSentAt: appointment.reminderSentAt?.toISOString() ?? null,
    createdAt: appointment.createdAt.toISOString(),
  };
}

const bookedAppointmentCount = {
  select: { appointments: { where: { status: 'booked' } } },
} as const;

/** Future slots that still have room, soonest first. */
export async function getBookableSlots(
  service?: string,
): Promise<AppointmentSlotView[]> {
  const slots = await prisma.appointmentSlot.findMany({
    where: {
      startsAt: { gt: new Date() },
      ...(service ? { service } : {}),
    },
    orderBy: { startsAt: 'asc' },
    take: 300,
    include: { _count: bookedAppointmentCount },
  });

  return slots
    .map((slot) => toSlotView(slot, slot._count.appointments))
    .filter((slot) => slot.remaining > 0);
}

export async function getSlotById(
  id: string,
): Promise<AppointmentSlotView | null> {
  const slot = await prisma.appointmentSlot.findUnique({
    where: { id },
    include: { _count: bookedAppointmentCount },
  });

  return slot ? toSlotView(slot, slot._count.appointments) : null;
}

/** All future slots, including full ones — for staff management. */
export async function getUpcomingSlots(): Promise<AppointmentSlotView[]> {
  const slots = await prisma.appointmentSlot.findMany({
    where: { startsAt: { gt: new Date() } },
    orderBy: { startsAt: 'asc' },
    take: 300,
    include: { _count: bookedAppointmentCount },
  });

  return slots.map((slot) => toSlotView(slot, slot._count.appointments));
}

export type CreateAppointmentResult =
  | { ok: true; appointment: AppointmentView }
  | { ok: false; error: 'slot_unavailable' };

/** Books a slot, re-checking capacity inside a transaction (no overbooking). */
export async function createAppointment(input: {
  userId: string | null;
  slotId: string;
  name: string;
  email: string;
  phone: string | null;
  reason: string;
}): Promise<CreateAppointmentResult> {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.appointmentSlot.findUnique({
      where: { id: input.slotId },
    });

    if (!slot || slot.startsAt.getTime() <= Date.now()) {
      return { ok: false, error: 'slot_unavailable' } as const;
    }

    const booked = await tx.appointment.count({
      where: { slotId: slot.id, status: 'booked' },
    });

    if (booked >= slot.capacity) {
      return { ok: false, error: 'slot_unavailable' } as const;
    }

    const appointment = await tx.appointment.create({
      data: {
        reference: generateReference('RDV'),
        userId: input.userId,
        slotId: slot.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        reason: input.reason,
      },
      include: { slot: true },
    });

    return { ok: true, appointment: toAppointmentView(appointment) } as const;
  });
}

export async function getUserAppointments(
  userId: string,
): Promise<AppointmentView[]> {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { slot: { startsAt: 'desc' } },
    include: { slot: true },
  });

  return appointments.map(toAppointmentView);
}

export async function getStaffAppointments(): Promise<AppointmentView[]> {
  const appointments = await prisma.appointment.findMany({
    orderBy: { slot: { startsAt: 'asc' } },
    take: 200,
    include: { slot: true },
  });

  return appointments.map(toAppointmentView);
}

export async function cancelAppointment(
  id: string,
  userId: string,
): Promise<boolean> {
  const result = await prisma.appointment.updateMany({
    where: { id, userId, status: 'booked' },
    data: { status: 'cancelled' },
  });

  return result.count > 0;
}

export type CreateSlotResult =
  { ok: true; slot: AppointmentSlotView } | { ok: false; error: 'duplicate' };

export async function createSlot(input: {
  service: string;
  startsAt: Date;
  durationMinutes: number;
  agentName: string | null;
  location: string | null;
  capacity: number;
}): Promise<CreateSlotResult> {
  const existing = await prisma.appointmentSlot.findUnique({
    where: {
      service_startsAt: { service: input.service, startsAt: input.startsAt },
    },
  });

  if (existing) {
    return { ok: false, error: 'duplicate' };
  }

  const slot = await prisma.appointmentSlot.create({
    data: {
      service: input.service,
      startsAt: input.startsAt,
      durationMinutes: input.durationMinutes,
      agentName: input.agentName,
      location: input.location,
      capacity: input.capacity,
    },
  });

  return { ok: true, slot: toSlotView(slot, 0) };
}

export async function deleteSlot(id: string): Promise<void> {
  await prisma.appointmentSlot.delete({ where: { id } });
}

/** Booked appointments starting within `withinMs` and not yet reminded. */
export async function getAppointmentsDueForReminder(
  withinMs = 24 * 60 * 60 * 1000,
): Promise<AppointmentView[]> {
  const now = new Date();
  const horizon = new Date(now.getTime() + withinMs);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: 'booked',
      reminderSentAt: null,
      slot: { startsAt: { gt: now, lte: horizon } },
    },
    include: { slot: true },
  });

  return appointments.map(toAppointmentView);
}

export async function markAppointmentsReminded(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  await prisma.appointment.updateMany({
    where: { id: { in: ids } },
    data: { reminderSentAt: new Date() },
  });
}
