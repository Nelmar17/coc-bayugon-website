import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const { public_id } = await req.json();
  if (!public_id) return NextResponse.json("Missing id", { status: 400 });

  await cloudinary.uploader.destroy(public_id);
  return NextResponse.json({ success: true });
}
