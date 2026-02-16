"use client";

import { useRef, useState } from "react";

export default function ImageUploadButton({
  onUploaded,
}: {
  onUploaded: (data: { url: string; public_id: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ client-side safety
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // ✅ REQUIRED BY YOUR API
      formData.append("file", file);
      formData.append("type", "image"); // 🔥 THIS WAS MISSING

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Upload failed:", res.status, text);
        alert(text || "Image upload failed");
        return;
      }

      const data = JSON.parse(text);

      if (data?.url && data?.public_id) {
        onUploaded({
          url: data.url,
          public_id: data.public_id,
        });
      } else {
        console.error("Invalid response:", data);
        alert("Invalid upload response");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-3 py-1 text-xs border rounded disabled:opacity-60"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
