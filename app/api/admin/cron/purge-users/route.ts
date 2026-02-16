import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const users = await prisma.user.findMany({
    where: {
      deletedAt: { lte: cutoff },
    },
    select: { id: true, email: true },
  });

  for (const u of users) {
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          action: "AUTO_PURGE",
          targetId: u.id,
          targetEmail: u.email,
          actorId: "system",
          actorRole: "system",
        },
      }),
      prisma.user.delete({ where: { id: u.id } }),
    ]);
  }

  return NextResponse.json({ purged: users.length });
}
