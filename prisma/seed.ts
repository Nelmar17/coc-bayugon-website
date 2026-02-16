// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pw = await hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@church.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@church.local",
      password: pw,
      role: "admin",
    },
  });

  console.log("Seeded admin user (email: admin@church.local, pw: admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
