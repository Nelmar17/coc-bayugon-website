// // lib/prisma.ts
// import { PrismaClient } from "@prisma/client";

// declare global {
//   // Prevent multiple instances in development (Hot Reload)
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ??
//   new PrismaClient({
//     log: ["query", "info", "warn", "error"], // optional, for debugging
//   });

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;



import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}





// import { PrismaClient } from "@prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// const globalForPrisma = globalThis as unknown as {
//   prisma: ReturnType<typeof createPrismaClient> | undefined;
// };

// function createPrismaClient() {
//   return new PrismaClient({
//     accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
//   }).$extends(withAccelerate());
// }

// export const prisma =
//   globalForPrisma.prisma ?? createPrismaClient();

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }
