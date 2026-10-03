import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';

import { buildHeatwaveRecommendations } from '@/lib/broadcasts';
import { prisma } from '@/lib/prisma';
import type { Role } from '@/lib/roles';

/**
 * Demo accounts for local/staging use (demandes D08 & D09).
 *
 * Idempotent: re-running updates the profile and resets the password of each
 * account. Credentials are written the way Better Auth expects them
 * (`account.providerId = "credential"`, `accountId = user.id`,
 * `password = hashPassword(...)`), so they can sign in immediately.
 *
 * Run with `npm run db:seed`. It is never triggered automatically.
 */

type SeedUser = {
  name: string;
  email: string;
  role: Role;
};

const password = process.env.SEED_PASSWORD ?? 'PreskEnLer2026!';

const seedUsers: SeedUser[] = [
  {
    name: 'Camille Martin',
    email: 'camille.martin@terranova.city',
    role: 'citizen',
  },
  {
    name: 'Yanis Bernard',
    email: 'yanis.bernard@terranova.city',
    role: 'citizen',
  },
  {
    name: 'Louise Petit',
    email: 'louise.petit@terranova.city',
    role: 'citizen',
  },
  {
    name: 'Régie État civil',
    email: 'agent.etat-civil@terranova.city',
    role: 'agent',
  },
  {
    name: 'Régie Propreté',
    email: 'agent.proprete@terranova.city',
    role: 'agent',
  },
  {
    name: 'Administrateur Terra Nova',
    email: 'admin@terranova.city',
    role: 'admin',
  },
];

async function seedUser(user: SeedUser) {
  const email = user.email.toLowerCase();

  const record = await prisma.user.upsert({
    where: { email },
    update: {
      name: user.name,
      role: user.role,
      emailVerified: true,
    },
    create: {
      id: randomUUID(),
      name: user.name,
      email,
      role: user.role,
      emailVerified: true,
    },
  });

  const hashed = await hashPassword(password);
  const account = await prisma.account.findFirst({
    where: { userId: record.id, providerId: 'credential' },
  });

  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { accountId: record.id, password: hashed },
    });
  } else {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: record.id,
        providerId: 'credential',
        userId: record.id,
        password: hashed,
      },
    });
  }

  return { name: user.name, email, role: user.role, password };
}

type SeedBroadcast = {
  code: string;
  title: string;
  body: string;
  level: string;
  topic: string;
  audience: string;
  area: string | null;
  recommendations: string | null;
  isAi: boolean;
};

/** Demo broadcasts (demandes D18, F29, F30, F31); idempotent via `code`. */
const seedBroadcastFixtures: SeedBroadcast[] = [
  {
    code: 'seed-welcome',
    title: 'Bienvenue sur le portail numérique',
    body: 'Le portail de la Ville de Terra Nova réunit les services municipaux, les annonces et tes démarches au même endroit.',
    level: 'info',
    topic: 'general',
    audience: 'all',
    area: null,
    recommendations: null,
    isAi: false,
  },
  {
    code: 'seed-flood-south',
    title: 'Montée des eaux dans le quartier sud',
    body: 'Une montée inhabituelle du niveau de l’eau est observée dans le quartier sud. Évite les berges et les passages bas jusqu’à nouvel ordre.',
    level: 'alert',
    topic: 'flood',
    audience: 'all',
    area: 'Quartier sud',
    recommendations: null,
    isAi: false,
  },
  {
    code: 'seed-heatwave',
    title: 'Vague de chaleur : recommandations',
    body: 'Une vague de chaleur extrême touche actuellement plusieurs secteurs de la ville. Les personnes vulnérables doivent être informées et suivre les recommandations adaptées.',
    level: 'alert',
    topic: 'heatwave',
    audience: 'vulnerable',
    area: null,
    recommendations: buildHeatwaveRecommendations('vulnerable'),
    isAi: true,
  },
  {
    code: 'seed-saturday-civil-status',
    title: 'Permanences d’état civil le samedi matin',
    body: 'Le service d’état civil ouvre désormais ses permanences le samedi matin sur rendez-vous.',
    level: 'warning',
    topic: 'announcement',
    audience: 'all',
    area: null,
    recommendations: null,
    isAi: false,
  },
];

async function seedBroadcasts() {
  for (const broadcast of seedBroadcastFixtures) {
    await prisma.broadcast.upsert({
      where: { code: broadcast.code },
      update: broadcast,
      create: broadcast,
    });
  }

  return seedBroadcastFixtures.length;
}

/** Demo bookable slots for the next open weekdays (demande F39). */
const appointmentServices = [
  {
    service: 'etat-civil',
    agentName: 'Régie État civil',
    location: 'Hôtel de ville — bureau 12',
  },
  {
    service: 'voirie-mobilite',
    agentName: 'Service Voirie',
    location: 'Centre technique municipal',
  },
  {
    service: 'action-sociale',
    agentName: 'Service social',
    location: 'Maison des solidarités',
  },
];

const slotTimes = [
  { hours: 9, minutes: 30 },
  { hours: 14, minutes: 0 },
];

async function seedAppointmentSlots() {
  const now = new Date();
  const slots: {
    service: string;
    startsAt: Date;
    durationMinutes: number;
    agentName: string;
    location: string;
    capacity: number;
  }[] = [];

  for (let offset = 1; offset <= 10; offset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 6) {
      continue;
    }

    for (const entry of appointmentServices) {
      for (const time of slotTimes) {
        const startsAt = new Date(day);
        startsAt.setHours(time.hours, time.minutes, 0, 0);
        slots.push({
          service: entry.service,
          startsAt,
          durationMinutes: 30,
          agentName: entry.agentName,
          location: entry.location,
          capacity: 1,
        });
      }
    }
  }

  const result = await prisma.appointmentSlot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  return result.count;
}

/** One service in maintenance so the availability flow is visible (F38). */
async function seedServiceStatus() {
  const expectedReturn = new Date();
  expectedReturn.setDate(expectedReturn.getDate() + 1);
  expectedReturn.setHours(8, 0, 0, 0);

  await prisma.serviceStatus.upsert({
    where: { service: 'eau-assainissement' },
    update: {},
    create: {
      service: 'eau-assainissement',
      status: 'maintenance',
      message:
        'Maintenance du réseau d’eau potable jusqu’à demain matin. Les urgences restent prises en charge.',
      expectedReturn,
      alternative:
        'Pour une fuite urgente, contacte la voirie au 01 23 45 67 89.',
    },
  });
}

async function main() {
  const seeded = [];

  for (const user of seedUsers) {
    seeded.push(await seedUser(user));
  }

  const broadcastCount = await seedBroadcasts();
  const slotCount = await seedAppointmentSlots();
  await seedServiceStatus();

  console.table(seeded);
  console.log(`[seed] ${broadcastCount} broadcasts ready`);
  console.log(`[seed] ${slotCount} appointment slots added`);
}

main()
  .catch((error) => {
    console.error('[seed] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
