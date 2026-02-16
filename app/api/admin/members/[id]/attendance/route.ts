import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: any) {
  const id = context?.params?.id; // use optional chaining to be safe

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const records = await prisma.attendance.findMany({
    where: { memberId: Number(id) },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}




// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const records = await prisma.attendance.findMany({
//     where: { memberId: Number(params.id) },
//     orderBy: { date: "desc" },
//   });

//   return NextResponse.json(records);
// }
