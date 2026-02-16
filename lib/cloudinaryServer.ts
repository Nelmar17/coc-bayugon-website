import cloudinary from "@/lib/cloudinary";

export async function deleteCloudinaryServer(
  publicId?: string | null,
  resourceType: "image" | "video" | "raw" = "image"
) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
  }
}
