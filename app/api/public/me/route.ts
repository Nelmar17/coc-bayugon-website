// app/api/public/me/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  if (!token) return null;
  return getUserFromToken(token);
}

export async function GET() {
  const user = await requireLogin();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1️⃣ STRONG LINK
    let member = await prisma.member.findFirst({
      where: { userId: user.id },
    });

    // 2️⃣ FALLBACK (legacy email)
    if (!member && user.email) {
      member = await prisma.member.findFirst({
        where: {
          email: user.email,
          userId: null, // 🚫 don’t steal linked members
        },
      });
    }

    if (!member) {
      return NextResponse.json(
        { message: "Member profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      congregation: member.congregation,
      dateOfBaptism: member.dateOfBaptism, // ⭐ BaptismBadge works
      createdAt: member.createdAt,
      userLinked: member.userId === user.id, // ⭐ keep this
    });
  } catch (err) {
    console.error("❌ /api/public/me failed:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}




// // app/api/public/me/route.ts
// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// /* ---------------------------------------------
//  * Helpers
//  * -------------------------------------------- */

// async function requireLogin() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   if (!token) return null;
//   return getUserFromToken(token);
// }

// /* ---------------------------------------------
//  * GET: My Member Profile
//  * -------------------------------------------- */

// export async function GET() {
//   const user = await requireLogin();

//   if (!user) {
//     return NextResponse.json(
//       { message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   try {
//     // 1️⃣ STRONG LINK: userId
//     let member = await prisma.member.findFirst({
//       where: { userId: user.id },
//     });

//     // 2️⃣ FALLBACK: email match (legacy members)
//     if (!member && user.email) {
//       member = await prisma.member.findFirst({
//         where: {
//           email: user.email,
//           userId: null, // prevent stealing linked member
//         },
//       });
//     }

//     // ❌ Not a member (EXPECTED case)
//     if (!member) {
//       return NextResponse.json(
//         { message: "Member profile not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       id: member.id,
//       firstName: member.firstName,
//       lastName: member.lastName,
//       email: member.email,
//       congregation: member.congregation,
//       dateOfBaptism: member.dateOfBaptism,
//       createdAt: member.createdAt,
//       userLinked: member.userId === user.id,
//     });
//   } catch (err) {
//     console.error("❌ /api/public/me failed:", err);
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }




