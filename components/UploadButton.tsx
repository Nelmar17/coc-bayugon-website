"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  accept: string;
  type: "image" | "audio" | "video" | "document";
  onUploaded: (data: { url: string; public_id: string }) => void;
};

export default function UploadButton({ label, accept, type, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (data?.url && data?.public_id) {
      onUploaded(data);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-3 py-1 border rounded text-xs"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
