import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toICSDate(d: Date) {
  // UTC format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ message: "Missing eventId" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
  });

  if (!event || !event.isPublished) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const start = new Date(event.eventDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);

  const uid = `event-${event.id}@coc`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//COC//Special Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${String(event.title).replace(/\n/g, " ")}`,
    event.location ? `LOCATION:${String(event.location).replace(/\n/g, " ")}` : "",
    event.description ? `DESCRIPTION:${String(event.description).replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
    },
  });
}
