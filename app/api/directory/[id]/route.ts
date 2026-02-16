import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

/* =====================================================
 * AUTH HELPERS
 * ===================================================== */
async function requireEditorOrAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user) return null;

  return ["admin", "editor"].includes(user.role) ? user : null;
}

async function requireAdminOnly() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const user = await getUserFromToken(token);
  return user?.role === "admin" ? user : null;
}


/* ---------------- POST ---------------- */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await getUserFromToken(token);
  if (!user || !["admin", "editor"].includes(user.role)) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const data = await req.json();

  // ✅ REMOVE NON-DB FIELD
  const { removedGalleryIds, ...safeData } = data;

  const newItem = await prisma.directory.create({
    data: safeData,
  });

  return NextResponse.json(newItem, { status: 201 });
}


/* =====================================================
 * GET (PUBLIC / ADMIN / EDITOR)
 * ===================================================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const item = await prisma.directory.findUnique({
    where: { id: Number(id) },
  });

  if (!item) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}

/* =====================================================
 * PUT (ADMIN + EDITOR)
 * ===================================================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireEditorOrAdmin();
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const body = await req.json();

  const {
    removedGalleryIds = [],
    ...updateData
  } = body;

  // 🔥 Ensure record exists
  const existing = await prisma.directory.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  // 🧹 Delete removed images from Cloudinary
  for (const publicId of removedGalleryIds) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary delete error:", publicId, err);
    }
  }

  const updated = await prisma.directory.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return NextResponse.json(updated);
}

/* =====================================================
 * DELETE (ADMIN ONLY)
 * ===================================================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminOnly();
  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const item = await prisma.directory.findUnique({
    where: { id: Number(id) },
  });

  if (!item) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  // 🧹 delete main photo
  if (item.mainPhotoId) {
    try {
      await cloudinary.uploader.destroy(item.mainPhotoId);
    } catch (err) {
      console.error("Main photo delete error:", err);
    }
  }

  // 🧹 delete gallery images
  for (const pid of item.galleryIds ?? []) {
    try {
      await cloudinary.uploader.destroy(pid);
    } catch (err) {
      console.error("Gallery image delete error:", pid, err);
    }
  }

  await prisma.directory.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}



// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";
// import cloudinary from "@/lib/cloudinary";

// /* ---------------- AUTH ---------------- */
// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);
//   return user?.role === "admin" ? user : null;
// }

// /* ---------------- GET ---------------- */
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   const item = await prisma.directory.findUnique({
//     where: { id: Number(id) },
//   });

//   return NextResponse.json(item);
// }

// /* ---------------- PUT ---------------- */
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   if (!(await requireAdmin())) {
//     return NextResponse.json("Unauthorized", { status: 401 });
//   }

//   const { id } = await context.params;
//   const data = await req.json();

//   const {
//     removedGalleryIds = [],
//     ...updateData
//   } = data;

//   // ✅ DELETE REMOVED IMAGES FROM CLOUDINARY
//   for (const publicId of removedGalleryIds) {
//     await cloudinary.uploader.destroy(publicId);
//   }

//   const updated = await prisma.directory.update({
//     where: { id: Number(id) },
//     data: updateData,
//   });

//   return NextResponse.json(updated);
// }

// /* ---------------- DELETE ---------------- */
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   if (!(await requireAdmin())) {
//     return NextResponse.json("Unauthorized", { status: 401 });
//   }

//   const { id } = await context.params;

//   const item = await prisma.directory.findUnique({
//     where: { id: Number(id) },
//   });

//   if (!item) {
//     return NextResponse.json("Not found", { status: 404 });
//   }

//   // 🧹 delete main photo
//   if (item.mainPhotoId) {
//     await cloudinary.uploader.destroy(item.mainPhotoId);
//   }

//   // 🧹 delete gallery images
//   for (const pid of item.galleryIds ?? []) {
//     await cloudinary.uploader.destroy(pid);
//   }

//   await prisma.directory.delete({
//     where: { id: Number(id) },
//   });

//   return NextResponse.json({ success: true });
// }
