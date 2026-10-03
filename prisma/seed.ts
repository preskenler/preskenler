import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';

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

async function main() {
  const seeded = [];

  for (const user of seedUsers) {
    seeded.push(await seedUser(user));
  }

  console.table(seeded);
}

main()
  .catch((error) => {
    console.error('[seed] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
