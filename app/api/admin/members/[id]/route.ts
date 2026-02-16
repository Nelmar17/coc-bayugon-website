export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* =========================
   AUTH (UNCHANGED)
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

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) return null;

  return user.role === "admin" ? user : null;
}

/* =========================
   PARAM PARSER (UNCHANGED)
   ========================= */
async function getId(context: { params: Promise<{ id?: string }> | { id?: string } }) {
  const p: any = (context as any).params;
  const params = typeof p?.then === "function" ? await p : p;

  const idParam = params?.id;
  const id = Number(idParam);

  if (!idParam || Number.isNaN(id)) {
    return { ok: false as const, id: null, params };
  }

  return { ok: true as const, id, params };
}

/* =========================
   GET ONE (MINOR ADD)
   ========================= */
export async function GET(req: NextRequest, context: any) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = await getId(context);
  if (!parsed.ok) {
    console.log("❌ Invalid ID param (GET):", parsed.params);
    return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id: parsed.id },
      include: {
        user: {
          select: { id: true, email: true, name: true }, // ✅ ADD
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...member,
      emailMismatch:
        member.user &&
        member.email &&
        member.user.email !== member.email, // ✅ ADD (UI warning helper)
    });
  } catch (err) {
    console.error("❌ GET member failed:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* =========================
   UPDATE (ADD userId LINKING)
   ========================= */
export async function PUT(req: NextRequest, context: any) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = await getId(context);
  if (!parsed.ok) {
    console.log("❌ Invalid ID param (PUT):", parsed.params);
    return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log("✏️ UPDATE MEMBER", { id: parsed.id, body });

    const data: any = {
      firstName:
        body.firstName !== undefined
          ? String(body.firstName).trim()
          : undefined,

      lastName:
        body.lastName !== undefined
          ? String(body.lastName).trim()
          : undefined,

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
    };

    /* =========================
       🔗 USER LINKING (ADD ONLY)
       ========================= */
    if (body.userId !== undefined) {
      if (!body.userId) {
        data.userId = null; // unlink
      } else {
        const targetUser = await prisma.user.findUnique({
          where: { id: String(body.userId) },
        });

        if (!targetUser) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
          );
        }

        // prevent double-link
        const existing = await prisma.member.findFirst({
          where: {
            userId: targetUser.id,
            id: { not: parsed.id },
          },
        });

        if (existing) {
            return NextResponse.json(
            { message: "User already linked to another member" },
            { status: 409 }
          );
        }

        data.userId = targetUser.id;
      }
    }

    const updated = await prisma.member.update({
      where: { id: parsed.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ Update failed:", err);

    if (err?.code === "P2025") {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE (UNCHANGED)
   ========================= */
export async function DELETE(req: NextRequest, context: any) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = await getId(context);
  if (!parsed.ok) {
    console.log("❌ Invalid ID param (DELETE):", parsed.params);
    return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
  }

  try {
    await prisma.member.delete({
      where: { id: parsed.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete failed:", err);

    if (err?.code === "P2025") {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}



// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// /* =========================
//    AUTH
//    ========================= */
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

// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   const user = await getUserFromToken(token);
//   if (!user) return null;

//   return user.role === "admin" ? user : null;
// }

// /* =========================
//    PARAM PARSER (UNCHANGED)
//    ========================= */
// async function getId(context: { params: Promise<{ id?: string }> | { id?: string } }) {
//   const p: any = (context as any).params;
//   const params = typeof p?.then === "function" ? await p : p;

//   const idParam = params?.id;
//   const id = Number(idParam);

//   if (!idParam || Number.isNaN(id)) {
//     return { ok: false as const, id: null, params };
//   }

//   return { ok: true as const, id, params };
// }

// /* =========================
//    GET ONE
//    ========================= */
// export async function GET(req: NextRequest, context: any) {
//   const user = await requireStaff();
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (GET):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     const member = await prisma.member.findUnique({
//       where: { id: parsed.id },
//     });

//     if (!member) {
//       return NextResponse.json({ message: "Not found" }, { status: 404 });
//     }

//     return NextResponse.json(member);
//   } catch (err) {
//     console.error("❌ GET member failed:", err);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

// /* =========================
//    UPDATE
//    ========================= */
// export async function PUT(req: NextRequest, context: any) {
//   const user = await requireStaff();
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (PUT):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     console.log("✏️ UPDATE MEMBER", { id: parsed.id, body });

//     const updated = await prisma.member.update({
//       where: { id: parsed.id },
//       data: {
//         firstName:
//           body.firstName !== undefined
//             ? String(body.firstName).trim()
//             : undefined,

//         lastName:
//           body.lastName !== undefined
//             ? String(body.lastName).trim()
//             : undefined,

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

//         // ✅ ADD LANG
//         dateOfBaptism:
//           body.dateOfBaptism !== undefined
//             ? body.dateOfBaptism
//               ? new Date(body.dateOfBaptism)
//               : null
//             : undefined,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (err: any) {
//     console.error("❌ Update failed:", err);

//     if (err?.code === "P2025") {
//       return NextResponse.json(
//         { message: "Member not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Update failed" },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    DELETE (UNCHANGED)
//    ========================= */
// export async function DELETE(req: NextRequest, context: any) {
//   const user = await requireAdmin();
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (DELETE):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     await prisma.member.delete({
//       where: { id: parsed.id },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("❌ Delete failed:", err);

//     if (err?.code === "P2025") {
//       return NextResponse.json(
//         { message: "Member not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Delete failed" },
//       { status: 500 }
//     );
//   }
// }










// // app/api/admin/members/[id]/route.ts
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
//   if (role === "admin" || role === "editor" || role === "content_manager") return user;
//   return null;
// }

// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   const user = await getUserFromToken(token);
//   if (!user) return null;

//   return user.role === "admin" ? user : null;
// }

// // ✅ Next.js latest: params can be a Promise → unwrap it
// async function getId(context: { params: Promise<{ id?: string }> | { id?: string } }) {
//   const p: any = (context as any).params;
//   const params = typeof p?.then === "function" ? await p : p;

//   const idParam = params?.id;
//   const id = Number(idParam);

//   if (!idParam || Number.isNaN(id)) {
//     return { ok: false as const, id: null, params };
//   }

//   return { ok: true as const, id, params };
// }

// export async function GET(req: NextRequest, context: any) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (GET):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     const member = await prisma.member.findUnique({ where: { id: parsed.id } });
//     if (!member) return NextResponse.json({ message: "Not found" }, { status: 404 });

//     return NextResponse.json(member);
//   } catch (err) {
//     console.error("❌ GET member failed:", err);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

// export async function PUT(req: NextRequest, context: any) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (PUT):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     console.log("✏️ UPDATE MEMBER", { id: parsed.id, body });

//     const updated = await prisma.member.update({
//       where: { id: parsed.id },
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
//   } catch (err: any) {
//     console.error("❌ Update failed:", err);

//     if (err?.code === "P2025") {
//       return NextResponse.json({ message: "Member not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Update failed" }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest, context: any) {
//   const user = await requireAdmin();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const parsed = await getId(context);
//   if (!parsed.ok) {
//     console.log("❌ Invalid ID param (DELETE):", parsed.params);
//     return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
//   }

//   try {
//     await prisma.member.delete({ where: { id: parsed.id } });
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("❌ Delete failed:", err);

//     if (err?.code === "P2025") {
//       return NextResponse.json({ message: "Member not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Delete failed" }, { status: 500 });
//   }
// }
