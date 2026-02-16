import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({
      sermons: [],
      bibleStudies: [],
      events: [],
      directory: [],
    });
  }

  const [sermons, bibleStudies, events, directory] = await Promise.all([
    prisma.sermon.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { preacher: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
      take: 5,
    }),

    prisma.bibleStudy.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { speaker: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { studyDate: "desc" },
      take: 5,
    }),

    prisma.event.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { eventDate: "desc" },
      take: 5,
    }),

    prisma.directory.findMany({
      where: {
        OR: [
          { congregationName: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
          { preacherName: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    sermons,
    bibleStudies,
    events,
    directory,
  });
}
