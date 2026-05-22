/* eslint-disable no-console */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@dataclean.local';
  const password = 'dataclean123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed: user ${email} already exists — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, name: 'Demo Operator' },
    });
    const org = await tx.organization.create({
      data: { name: 'Demo Org', slug: 'demo-org' },
    });
    await tx.workspace.create({
      data: { organizationId: org.id, name: 'Default', slug: 'default' },
    });
    await tx.membership.create({
      data: { userId: user.id, organizationId: org.id, role: Role.OWNER },
    });
  });

  console.log(`Seed: created demo user — ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
