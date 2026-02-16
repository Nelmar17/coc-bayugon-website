export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

/* ------------------ CLOUDINARY CONFIG ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* ------------------ UPLOAD AVATAR ------------------ */
export async function POST(req: NextRequest) {
  try {
    /* 🔐 AUTH */
    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    /* 📥 FORM DATA */
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    /* 🧠 GET OLD AVATAR (IMPORTANT) */
    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarPublicId: true },
    });

    /* 🔄 FILE → BUFFER */
    const buffer = Buffer.from(await file.arrayBuffer());

    /* ☁️ UPLOAD TO CLOUDINARY */
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          resource_type: "image",
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    /* 💾 SAVE NEW AVATAR */
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: uploadResult.secure_url,
        avatarPublicId: uploadResult.public_id,
      },
    });

    /* 🧹 DELETE OLD AVATAR (SAFE, NON-BLOCKING) */
    if (existing?.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(existing.avatarPublicId, {
          resource_type: "image",
        });
      } catch (err) {
        console.warn("Cloudinary delete failed:", err);
      }
    }

    /* ✅ RESPONSE */
    return NextResponse.json({
      success: true,
      avatarUrl: uploadResult.secure_url,
      avatarUpdatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Avatar Upload ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}






// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getUserFromToken } from "@/lib/auth";
// import { cookies } from "next/headers";
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const token = (await cookies()).get("token")?.value;
//     const user = await getUserFromToken(token);

//     if (!user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const form = await req.formData();
//     const file = form.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json(
//         { message: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     // Convert file → buffer
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // 🔥 FIX: Wrap upload_stream in a REAL Promise
//     const uploadResult: any = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           folder: "avatars",
//           resource_type: "image",
//         },
//         (err, result) => {
//           if (err) reject(err);
//           else resolve(result);
//         }
//       );

//       stream.end(buffer);
//     });

//     // Save uploaded avatar URL
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { avatarUrl: uploadResult.secure_url },
//     });

//     return NextResponse.json({
//       success: true,
//       avatarUrl: uploadResult.secure_url,
//       avatarUpdatedAt: Date.now(),
//     });
//   } catch (error) {
//     console.error("Avatar Upload ERROR:", error);
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
