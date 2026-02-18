// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAuth";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/* ------------------ GET USERS (ACTIVE ONLY) ------------------ */
export async function GET() {
  const admin = await requireAdmin(["admin", "editor"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null }, // ✅ IMPORTANT: hide soft-deleted users
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

/* ------------------ CREATE USER ------------------ */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const { name, email, password, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  // ✅ If email exists (even if deleted), treat as used (safer)
  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (exists) {
    return NextResponse.json({ message: "Email already used" }, { status: 409 });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ message: "Email already used" }, { status: 409 });
    }

    console.error("Create user error:", err);
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// /* ---------------- AUTH ---------------- */
// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value;
//   if (!token) return null;

//   const user = await getUserFromToken(token);
//   return user?.role === "admin" ? user : null;
// }

// /* ---------------- GET USERS ---------------- */
// export async function GET() {
//   const admin = await requireAdmin();
//   if (!admin) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const users = await prisma.user.findMany({
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       avatarUrl: true,
//       createdAt: true,
//     },
//   });

//   return NextResponse.json(users);
// }

// /* ---------------- CREATE USER ---------------- */
// export async function POST(req: NextRequest) {
//   const admin = await requireAdmin();
//   if (!admin) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const { name, email, password, role } = await req.json();

//   if (!email || !password) {
//     return NextResponse.json(
//       { message: "Missing fields" },
//       { status: 400 }
//     );
//   }

//   /* 🔴 CHECK DUPLICATE EMAIL */
//   const exists = await prisma.user.findUnique({
//     where: { email },
//     select: { id: true },
//   });

//   if (exists) {
//     return NextResponse.json(
//       { message: "Email already used" },
//       { status: 409 }
//     );
//   }

//   const hashed = await bcrypt.hash(password, 10);

//   const user = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password: hashed,
//       role,
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       avatarUrl: true,
//     },
//   });

//   return NextResponse.json(user, { status: 201 });
// }
