export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* =========================
   AUTH
   ========================= */
async function requireStaff() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) return null;

  const role = user.role;
  if (role === "admin" || role === "editor" || role === "content_manager") {
    return user;
  }

  return null;
}

/* =========================
   GET ALL MEMBERS
   ========================= */
export async function GET() {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return NextResponse.json(members);
}

/* =========================
   CREATE MEMBER
   ========================= */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const created = await prisma.member.create({
      data: {
        firstName: String(body.firstName ?? "").trim(),
        lastName: String(body.lastName ?? "").trim(),

        gender:
          body.gender !== undefined
            ? body.gender
              ? String(body.gender)
              : null
            : undefined,

        phone:
          body.phone !== undefined
            ? body.phone
              ? String(body.phone)
              : null
            : undefined,

        email:
          body.email !== undefined
            ? body.email
              ? String(body.email)
              : null
            : undefined,

        congregation:
          body.congregation !== undefined
            ? body.congregation
              ? String(body.congregation)
              : null
            : undefined,

        birthday:
          body.birthday !== undefined
            ? body.birthday
              ? new Date(body.birthday)
              : null
            : undefined,

        dateOfBaptism:
          body.dateOfBaptism !== undefined
            ? body.dateOfBaptism
              ? new Date(body.dateOfBaptism)
              : null
            : undefined,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("❌ Create member failed:", err);
    return NextResponse.json(
      { message: "Create failed" },
      { status: 500 }
    );
  }
}


// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// async function requireStaff() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   const user = await getUserFromToken(token);
//   if (!user) return null;

//   const role = user.role;
//   if (role === "admin" || role === "editor" || role === "content_manager") {
//     return user;
//   }

//   return null;
// }

// /* =========================
//    GET ALL MEMBERS
//    ========================= */
// export async function GET() {
//   const user = await requireStaff();
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const members = await prisma.member.findMany({
//     orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
//   });

//   return NextResponse.json(members);
// }

// /* =========================
//    CREATE MEMBER
//    ========================= */
// export async function POST(req: NextRequest) {
//   const user = await requireStaff();
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();

//   try {
//     const created = await prisma.member.create({
//       data: {
//         firstName: String(body.firstName ?? "").trim(),
//         lastName: String(body.lastName ?? "").trim(),

//         gender:
//           body.gender !== undefined
//             ? body.gender
//               ? String(body.gender)
//               : null
//             : undefined,

//         phone:
//           body.phone !== undefined
//             ? body.phone
//               ? String(body.phone)
//               : null
//             : undefined,

//         email:
//           body.email !== undefined
//             ? body.email
//               ? String(body.email)
//               : null
//             : undefined,

//         congregation:
//           body.congregation !== undefined
//             ? body.congregation
//               ? String(body.congregation)
//               : null
//             : undefined,

//         birthday:
//           body.birthday !== undefined
//             ? body.birthday
//               ? new Date(body.birthday)
//               : null
//             : undefined,
     
//         dateOfBaptism:
//           body.dateOfBaptism !== undefined
//             ? body.dateOfBaptism
//               ? new Date(body.dateOfBaptism)
//               : null
//             : undefined,
//       },
//     });

//     return NextResponse.json(created, { status: 201 });
//   } catch (err) {
//     console.error("❌ Create member failed:", err);
//     return NextResponse.json(
//       { message: "Create failed" },
//       { status: 500 }
//     );
//   }
// }











// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// async function requireStaff() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   const user = await getUserFromToken(token);
//   if (!user) return null;

//   // allow admin/editor/content_manager
//   const role = user.role;
//   if (role === "admin" || role === "editor" || role === "content_manager") return user;
//   return null;
// }

// export async function GET() {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const members = await prisma.member.findMany({
//     orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
//   });

//   return NextResponse.json(members);
// }


// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   const user = await requireStaff();
//   if (!user) {
//     console.log("❌ Unauthorized PUT");
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const id = Number(params.id);
//   if (Number.isNaN(id)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();

//     const updated = await prisma.member.update({
//       where: { id },
//       data: {
//         firstName: body.firstName !== undefined ? String(body.firstName).trim() : undefined,
//         lastName: body.lastName !== undefined ? String(body.lastName).trim() : undefined,
//         gender: body.gender !== undefined ? (body.gender ? String(body.gender) : null) : undefined,
//         phone: body.phone !== undefined ? (body.phone ? String(body.phone) : null) : undefined,
//         email: body.email !== undefined ? (body.email ? String(body.email) : null) : undefined,
//         congregation: body.congregation !== undefined ? (body.congregation ? String(body.congregation) : null) : undefined,
//         birthday:
//           body.birthday !== undefined
//             ? body.birthday
//               ? new Date(body.birthday)
//               : null
//             : undefined,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("❌ Update failed:", err);
//     return NextResponse.json({ message: "Update failed" }, { status: 500 });
//   }
// }


// export async function POST(req: NextRequest) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const body = await req.json();

//   const created = await prisma.member.create({
//     data: {
//       firstName: String(body.firstName ?? "").trim(),
//       lastName: String(body.lastName ?? "").trim(),
//       gender: body.gender ? String(body.gender) : null,
//       phone: body.phone ? String(body.phone) : null,
//       email: body.email ? String(body.email) : null,
//       congregation: body.congregation ? String(body.congregation) : null,
//       birthday: body.birthday ? new Date(body.birthday) : null,
//     },
//   });

//   return NextResponse.json(created, { status: 201 });
// }
