import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds the baseline admin user and Manual Entry source.
 */
async function main(): Promise<void> {
  const email = (process.env.SEED_USER_EMAIL ?? 'admin@jobhunter.local').toLowerCase();
  const password = process.env.SEED_USER_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.SEED_USER_NAME ?? 'Admin';

  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
      locale: 'en',
    },
  });

  const manualSource = await prisma.source.findFirst({
    where: { name: 'Manual Entry' },
  });

  if (!manualSource) {
    await prisma.source.create({
      data: {
        name: 'Manual Entry',
        type: 'OTHER',
        atsType: 'CUSTOM',
        baseUrl: 'manual://entry',
        enabled: true,
      },
    });
  }

  console.log(`Seeded user: ${email}`);
  console.log('Seeded Manual Entry source');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
