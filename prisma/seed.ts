import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createAdmin(client: PrismaClient = prisma) {
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ??
    (await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'admin123', 10));
  const adminSeed = {
    name: process.env.ADMIN_NAME ?? 'Admin',
    email: process.env.ADMIN_EMAIL ?? 'admin@portfolio.local',
    passwordHash,
  };

  const admin = await client.user.upsert({
    where: {
      email: adminSeed.email,
    },
    update: {
      name: adminSeed.name,
      passwordHash: adminSeed.passwordHash,
    },
    create: adminSeed,
  });

  console.log(`Admin seed ready: ${admin.email}`);

  return admin;
}

async function main() {
  await createAdmin();
}

void main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
