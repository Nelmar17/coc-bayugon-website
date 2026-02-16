import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; 
  // type: image | audio | video | document

  if (!file || !type)
    return NextResponse.json("Invalid upload", { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resourceType =
    type === "image"
      ? "image"
      : type === "video"
      ? "video"
      : "raw"; // audio & documents

  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "church-of-christ/bible-studies",
          resource_type: resourceType,
        },
        (err, result) => {
          if (err || !result) reject(err);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return NextResponse.json({
    url: uploaded.secure_url,
    public_id: uploaded.public_id,
  });
}





//OLD CODE

// import { NextRequest, NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";
// import { getUserFromToken } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function POST(req: NextRequest) {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);

//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const formData = await req.formData();
//   const file = formData.get("file") as File | null;

//   if (!file) {
//     return NextResponse.json({ message: "No file" }, { status: 400 });
//   }

//   // OPTIONAL SAFETY CHECK
//   if (!file.type.startsWith("image/")) {
//     return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const uploaded = await new Promise<any>((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           folder: "church-of-christ",
//           resource_type: "image",
//           quality: "auto",
//           fetch_format: "auto",
//         },
//         (err, result) => {
//           if (err || !result) return reject(err);
//           resolve(result);
//         }
//       )
//       .end(buffer);
//   });

//   return NextResponse.json({
//     url: uploaded.secure_url,
//     public_id: uploaded.public_id,
//   });
// }






// import { NextRequest, NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";
// import { getUserFromToken } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function POST(req: NextRequest) {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);

//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const formData = await req.formData();
//   const file = formData.get("file") as File | null;

//   if (!file) {
//     return NextResponse.json({ message: "No file" }, { status: 400 });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const uploaded = await new Promise<any>((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder: "church-of-christ" }, (err, result) => {
//         if (err || !result) return reject(err);
//         resolve(result);
//       })
//       .end(buffer);
//   });

//   return NextResponse.json({
//     url: uploaded.secure_url,
//     public_id: uploaded.public_id,
//   });
// }
