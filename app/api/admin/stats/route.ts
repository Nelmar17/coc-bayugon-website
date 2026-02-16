export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [sermons, bibleStudy, events, articles, directory, schedules, members, messages] = await Promise.all([
      prisma.sermon.count().catch(() => 0),
      prisma.bibleStudy.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.article.count().catch(() => 0),
      prisma.directory.count().catch(() => 0),
      prisma.schedule.count().catch(() => 0),
      prisma.member.count().catch(() => 0),
      prisma.contactMessage.count({
      where: { resolved: false },}).catch(() => 0),
    ]);

    return NextResponse.json({
      sermons,
      bibleStudy,
      events,
      articles,
      directory,
      schedules,
      members,
      messages,
    });
  } catch (error) {
    console.error("ADMIN /stats API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getUserFromToken } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function GET(req: NextRequest) {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);

//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const [sermons, events, articles, directory, schedules] = await Promise.all([
//     prisma.sermon.count(),
//     prisma.event.count(),
//     prisma.article.count(),
//     prisma.directory.count(),
//     prisma.schedule.count(),
//   ]);

//   return NextResponse.json({
//     sermons,
//     events,
//     articles,
//     directory,
//     schedules,
//   });
// }
