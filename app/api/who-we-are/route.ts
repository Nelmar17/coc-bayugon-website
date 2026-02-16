import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

/* =========================
   GET (PUBLIC)
   ========================= */
export async function GET() {
  try {
    let record = await prisma.whoWeAre.findFirst();

    // Auto-create first record (ONE TIME ONLY)
    if (!record) {
      record = await prisma.whoWeAre.create({
        data: {
          intro:
            "We are Christians who strive to follow the teachings of Christ as revealed in the New Testament.",
          mission:
            "To preach the gospel, strengthen the faith of believers, and serve God faithfully according to His Word.",
          belief:
            "We believe in the authority of the Bible as the inspired Word of God.",
          identity:
            "We identify ourselves simply as Christians, members of the Church that belongs to Christ.",
          community:
            "We are a loving congregation that supports one another in faith, worship, and service.",
        },
      });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("WHO-WE-ARE GET ERROR:", err);
    return NextResponse.json(
      { message: "Failed to load Who We Are" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT (ADMIN ONLY)
   ========================= */
export async function PUT(req: Request) {
  const user = await requireAdmin(["admin"]);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await req.json();

    const existing = await prisma.whoWeAre.findFirst();
    if (!existing) {
      return NextResponse.json(
        { message: "Record not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.whoWeAre.update({
      where: { id: existing.id },
      data: {
        intro: data.intro || null,
        mission: data.mission,
        belief: data.belief,
        identity: data.identity,
        community: data.community,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("WHO-WE-ARE PUT ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update Who We Are" },
      { status: 500 }
    );
  }
}
