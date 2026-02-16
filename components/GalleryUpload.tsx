"use client";

import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";

type UploadResult = {
  url: string;
  public_id: string;
};

export default function GalleryUpload({
  urls,
  ids,
  onChange,
}: {
  urls: string[];
  ids: string[];
  onChange: (urls: string[], ids: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);

      const newUrls: string[] = [];
      const newIds: string[] = [];

      try {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });

          if (!res.ok) continue;

          const data: UploadResult = await res.json();

          if (data?.url && data?.public_id) {
            newUrls.push(data.url);
            newIds.push(data.public_id);
          }
        }

        onChange([...urls, ...newUrls], [...ids, ...newIds]);
      } finally {
        setUploading(false);
      }
    },
    [urls, ids, onChange]
  );

  const removeImage = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    const newIds = ids.filter((_, i) => i !== index);
    onChange(newUrls, newIds);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        {uploading
          ? "Uploading..."
          : "Drag & drop images here, or click to select"}
      </div>

      {/* GALLERY PREVIEW */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {urls.map((img, i) => (
          <div key={i} className="relative group">
            <img
              src={img}
              className="h-24 w-full object-cover rounded"
            />

            {/* DELETE BUTTON */}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="
                absolute top-1 right-1
                bg-black/70 text-white text-xs
                rounded-full w-5 h-5
                opacity-0 group-hover:opacity-100
                transition
              "
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
