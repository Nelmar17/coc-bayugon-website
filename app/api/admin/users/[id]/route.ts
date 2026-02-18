// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAuth";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/* ---------------- GET SINGLE USER ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin", "editor"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

/* ---------------- UPDATE USER ---------------- */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (existing.deletedAt) {
      return NextResponse.json({ message: "Cannot edit deleted user" }, { status: 410 });
    }

    if (body.email) {
      const dup = await prisma.user.findFirst({
        where: { email: body.email, id: { not: id } },
        select: { id: true },
      });

      if (dup) {
        return NextResponse.json({ message: "Email already used" }, { status: 409 });
      }
    }

    const data: any = {
      name: body.name,
      email: body.email,
      role: body.role,
    };

    if (body.password) data.password = await bcrypt.hash(body.password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ message: "Email already used" }, { status: 409 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/* ---------------- SOFT DELETE USER ---------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  if (admin.id === id) {
    return NextResponse.json(
      { message: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true, deletedAt: true },
  });

  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });
  if (target.deletedAt)
    return NextResponse.json({ message: "User already deleted" }, { status: 404 });

  if (admin.role === "admin" && target.role === "admin") {
    return NextResponse.json(
      { message: "You cannot delete another admin account." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}





// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// import { requireAdmin } from "@/lib/requireAuth";
// import { Prisma } from "@prisma/client";

// export const runtime = "nodejs";

// /* ---------------- UPDATE USER ---------------- */
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const admin = await requireAdmin(["admin"]);
//   if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const { id } = await context.params;
//   const body = await req.json();

//   try {
//     // ✅ Guard: user must exist
//     const existing = await prisma.user.findUnique({
//       where: { id },
//       select: { id: true, deletedAt: true },
//     });

//     if (!existing) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     // ✅ Guard: cannot edit deleted user
//     if (existing.deletedAt) {
//       return NextResponse.json({ message: "Cannot edit deleted user" }, { status: 410 });
//     }

//     // ✅ duplicate email check (exclude self)
//     if (body.email) {
//       const dup = await prisma.user.findFirst({
//         where: { email: body.email, id: { not: id } },
//         select: { id: true },
//       });

//       if (dup) {
//         return NextResponse.json({ message: "Email already used" }, { status: 409 });
//       }
//     }

//     const data: any = {
//       name: body.name,
//       email: body.email,
//       role: body.role,
//     };

//     if (body.password) data.password = await bcrypt.hash(body.password, 10);

//     const updated = await prisma.user.update({
//       where: { id },
//       data,
//       select: { id: true, name: true, email: true, role: true, avatarUrl: true },
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("UPDATE USER ERROR:", err);

//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
//       return NextResponse.json({ message: "Email already used" }, { status: 409 });
//     }

//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }

// /* ---------------- SOFT DELETE USER ---------------- */
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const admin = await requireAdmin(["admin"]);
//   if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const { id } = await context.params;

//   // ❌ prevent deleting self
//   if (admin.id === id) {
//     return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
//   }

//   const target = await prisma.user.findUnique({
//     where: { id },
//     select: { role: true, deletedAt: true },
//   });

//   // not found or already deleted
//   if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });
//   if (target.deletedAt) return NextResponse.json({ message: "User already deleted" }, { status: 404 });

//   // ✅ admin cannot delete another admin
//   if (admin.role === "admin" && target.role === "admin") {
//     return NextResponse.json(
//       { message: "You cannot delete another admin account." },
//       { status: 400 }
//     );
//   }

//   await prisma.user.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//   });

//   return NextResponse.json({ success: true });
// }









// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value;
//   if (!token) return null;

//   const user = await getUserFromToken(token);
//   return user?.role === "admin" ? user : null;
// }

// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const admin = await requireAdmin();
//   if (!admin)
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const { id } = await context.params; // ✅ FIXED — ALWAYS REQUIRED IN APP ROUTER

//   const body = await req.json();

//   const data: any = {
//     name: body.name,
//     email: body.email,
//     role: body.role,
//   };

//   if (body.password) {
//     data.password = await bcrypt.hash(body.password, 10);
//   }

//   const updated = await prisma.user.update({
//     where: { id },
//     data,
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       avatarUrl: true,
//     },
//   });

//   return NextResponse.json(updated);
// }

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const admin = await requireAdmin();
//   if (!admin)
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const { id } = await context.params; // ✅ FIXED

//   if (admin.id === id) {
//     return NextResponse.json(
//       { message: "You cannot delete your own account." },
//       { status: 400 }
//     );
//   }

//   await prisma.user.delete({ where: { id } });

//   return NextResponse.json({ success: true });
// }
