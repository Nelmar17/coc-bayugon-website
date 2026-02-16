export async function deleteCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw"
) {
  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId, resourceType }),
  });

  const text = await res.text();

  if (!res.ok) {
    if (text.includes("not found")) return;
    throw new Error(text || "Failed to delete file");
  }
}

