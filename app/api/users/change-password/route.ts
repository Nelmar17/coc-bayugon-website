// app/api/users/change-password/route.ts 
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  if (!token) return null;
  return getUserFromToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // FIELD NAMES
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // Get DB user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Compare old password
    const valid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Incorrect old password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Save new password
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}






// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const token = (await cookies()).get("token")?.value;
//     const user = await getUserFromToken(token);

//     if (!user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { oldPassword, newPassword } = await req.json();

//     if (!oldPassword || !newPassword) {
//       return NextResponse.json(
//         { message: "Missing fields" },
//         { status: 400 }
//       );
//     }

//     // Get the actual user from DB
//     const dbUser = await prisma.user.findUnique({
//       where: { id: user.id },
//     });

//     if (!dbUser) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Compare old password
//     const valid = await bcrypt.compare(oldPassword, dbUser.password);

//     if (!valid) {
//       return NextResponse.json(
//         { message: "Incorrect old password" },
//         { status: 400 }
//       );
//     }

//     // Hash new password
//     const hashed = await bcrypt.hash(newPassword, 10);

//     // Update DB
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { password: hashed },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Change password error:", err);
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
