import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

type ResourceType = "image" | "video" | "raw";

export async function POST(req: NextRequest) {
  try {
    /* ---------- AUTH ---------- */
    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------- BODY ---------- */
    const { publicId, resourceType } = (await req.json()) as {
      publicId?: string;
      resourceType?: ResourceType;
    };

    if (!publicId || !resourceType) {
      return NextResponse.json(
        { message: "publicId and resourceType are required" },
        { status: 400 }
      );
    }

    if (!["image", "video", "raw"].includes(resourceType)) {
      return NextResponse.json(
        { message: "Invalid resourceType" },
        { status: 400 }
      );
    }

    /* ---------- DELETE ---------- */
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    /**
     * ✅ VALID CLOUDINARY RESPONSES
     * - { result: "ok" }
     * - { result: "not found" }  <-- TREAT AS SUCCESS
     */
    if (result?.result === "ok" || result?.result === "not found") {
      return NextResponse.json({ success: true });
    }

    /* ---------- UNKNOWN RESPONSE ---------- */
    return NextResponse.json(
      {
        message: "Unexpected Cloudinary response",
        cloudinaryResult: result,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("CLOUDINARY DELETE ERROR:", err);

    return NextResponse.json(
      {
        message: "Failed to delete Cloudinary file",
        error: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}




//MALI
// // app/api/cloudinary/delete/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// type ResourceType = "image" | "video" | "raw";

// export async function POST(req: NextRequest) {
//   try {
//     /* ---------------- AUTH ---------------- */
//     const token = (await cookies()).get("token")?.value;
//     const user = await getUserFromToken(token);

//     if (!user || user.role !== "admin") {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     /* ---------------- BODY ---------------- */
//     let body: any;
//     try {
//       body = await req.json();
//     } catch {
//       return NextResponse.json(
//         { message: "Invalid JSON body" },
//         { status: 400 }
//       );
//     }

//     const { publicId, resourceType } = body as {
//       publicId?: string;
//       resourceType?: ResourceType;
//     };

//     if (!publicId || !resourceType) {
//       return NextResponse.json(
//         { message: "publicId and resourceType are required" },
//         { status: 400 }
//       );
//     }

//     if (!["image", "video", "raw"].includes(resourceType)) {
//       return NextResponse.json(
//         { message: "Invalid resourceType" },
//         { status: 400 }
//       );
//     }

//     /* ---------------- DELETE ---------------- */
//     const result = await cloudinary.uploader.destroy(publicId, {
//       resource_type: resourceType,
//     });

//     /**
//      * Cloudinary responses:
//      * - { result: "ok" }
//      * - { result: "not found" }
//      */
//     if (result?.result !== "ok") {
//       return NextResponse.json(
//         {
//           message: "Cloudinary delete failed",
//           cloudinaryResult: result,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("CLOUDINARY DELETE ERROR:", err);

//     return NextResponse.json(
//       {
//         message: "Failed to delete Cloudinary file",
//         error: err?.message ?? String(err),
//       },
//       { status: 500 }
//     );
//   }
// }
