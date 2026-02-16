"use client";

import { useRef, useState } from "react";
import Lightbox from "./Lightbox";

type Props = {
  urls: string[];
  ids: string[];
  onChange: (urls: string[], ids: string[]) => void;
};

export default function GalleryManager({ urls, ids, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  /* =============================
   ✅ UPLOAD IMAGE TO CLOUDINARY
  ============================== */
  async function upload(file: File) {
    // ✅ safety: images only
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    // 🔥 REQUIRED BY YOUR API
    fd.append("type", "image");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Gallery upload failed:", res.status, text);
        alert(text || "Gallery upload failed");
        return;
      }

      const data = JSON.parse(text);

      if (data?.url && data?.public_id) {
        onChange(
          [...urls, data.url],
          [...ids, data.public_id]
        );
      } else {
        console.error("Invalid upload response:", data);
        alert("Invalid upload response");
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Upload error");
    }
  }

  /* =============================
   ❌ DELETE IMAGE (AUTO CLOUDINARY)
  ============================== */
async function remove(index: number) {
  const publicId = ids[index];

  const res = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicId,              // ✅ camelCase (as required by your API)
      resourceType: "image",  // 🔥 REQUIRED
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Cloudinary delete failed:", res.status, text);
    alert(text || "Failed to delete image");
    return;
  }

  // 🔄 update UI ONLY if delete succeeded
  const newUrls = [...urls];
  const newIds = [...ids];

  newUrls.splice(index, 1);
  newIds.splice(index, 1);

  onChange(newUrls, newIds);
}


  /* =============================
   🔁 REORDER (DRAG & DROP)
  ============================== */
  function move(from: number, to: number) {
    if (from === to) return;

    const u = [...urls];
    const i = [...ids];

    const [url] = u.splice(from, 1);
    const [id] = i.splice(from, 1);

    u.splice(to, 0, url);
    i.splice(to, 0, id);

    onChange(u, i);
  }

  /* =============================
   🎨 UI
  ============================== */
  return (
    <div className="space-y-3">
      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-3 py-1 border rounded text-xs"
      >
        Upload gallery images
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (!e.target.files) return;
          [...e.target.files].forEach(upload);
          e.target.value = "";
        }}
      />

      {/* Gallery Grid */}
      <div className="grid grid-cols-3 gap-3">
        {urls.map((url, idx) => (
          <div
            key={ids[idx]}
            draggable
            onDragStart={() => (dragIndex.current = idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current !== null) {
                move(dragIndex.current, idx);
                dragIndex.current = null;
              }
            }}
            className="relative group cursor-move"
          >
            <img
              src={url}
              onClick={() => setPreview(url)}
              className="h-28 w-full object-cover rounded border"
            />

            {/* ❌ DELETE BUTTON */}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 🔍 LIGHTBOX */}
      {preview && (
        <Lightbox src={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}





// "use client";

// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { motion } from "framer-motion";

// type Props = {
//   urls: string[];
//   ids: string[];
//   onChange: (urls: string[], ids: string[]) => void;
//   onRemove?: (publicId: string) => void;
// };

// export default function GalleryManager({
//   urls,
//   ids,
//   onChange,
//   onRemove,
// }: Props) {
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: { distance: 8 }, // ✅ mobile-friendly
//     })
//   );

//   function handleDragEnd(e: any) {
//     if (!e.over) return;

//     const oldIndex = ids.indexOf(e.active.id);
//     const newIndex = ids.indexOf(e.over.id);

//     if (oldIndex !== newIndex) {
//       onChange(
//         arrayMove(urls, oldIndex, newIndex),
//         arrayMove(ids, oldIndex, newIndex)
//       );
//     }
//   }

//   function remove(index: number) {
//     const newUrls = [...urls];
//     const newIds = [...ids];

//     const removedId = newIds[index];

//     newUrls.splice(index, 1);
//     newIds.splice(index, 1);

//     onChange(newUrls, newIds);

//     if (onRemove && removedId) {
//       onRemove(removedId);
//     }
//   }

//   return (
//     <div>
//       <p className="font-semibold mb-2">
//         Gallery (drag to reorder, X to delete)
//       </p>

//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext items={ids}>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             {ids.map((id, i) => (
//               <SortableItem key={id} id={id}>
//                 <div className="relative group">
//                   <img
//                     src={urls[i]}
//                     className="h-32 w-full object-cover rounded"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => remove(i)}
//                     className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 hidden group-hover:block"
//                   >
//                     ×
//                   </button>
//                 </div>
//               </SortableItem>
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }

// function SortableItem({ id, children }: any) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id });

//   return (
//     <motion.div
//       ref={setNodeRef}
//       style={{ transform: CSS.Transform.toString(transform), transition }}
//       {...attributes}
//       {...listeners}
//       layout
//     >
//       {children}
//     </motion.div>
//   );
// }










// "use client";

// import { useRef, useState } from "react";
// import Lightbox from "./Lightbox";

// type Props = {
//   urls: string[];
//   ids: string[];
//   onChange: (urls: string[], ids: string[]) => void;
// };

// export default function GalleryManager({ urls, ids, onChange }: Props) {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const dragIndex = useRef<number | null>(null);

//   /* ---------------- UPLOAD ---------------- */
//   async function upload(file: File) {
//     const fd = new FormData();
//     fd.append("file", file);

//     const res = await fetch("/api/upload", { method: "POST", body: fd });
//     const data = await res.json();

//     if (data?.url && data?.public_id) {
//       onChange([...urls, data.url], [...ids, data.public_id]);
//     }
//   }

//   /* ---------------- DELETE ---------------- */
//   async function remove(index: number) {
//     const publicId = ids[index];

//     await fetch("/api/cloudinary/delete", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ publicId }),
//     });

//     const newUrls = [...urls];
//     const newIds = [...ids];
//     newUrls.splice(index, 1);
//     newIds.splice(index, 1);

//     onChange(newUrls, newIds);
//   }

//   /* ---------------- REORDER ---------------- */
//   function move(from: number, to: number) {
//     if (from === to) return;

//     const u = [...urls];
//     const i = [...ids];

//     const [url] = u.splice(from, 1);
//     const [id] = i.splice(from, 1);

//     u.splice(to, 0, url);
//     i.splice(to, 0, id);

//     onChange(u, i);
//   }

//   return (
//     <div className="space-y-3">
//       {/* Upload */}
//       <button
//         type="button"
//         onClick={() => inputRef.current?.click()}
//         className="px-3 py-1 border rounded text-xs"
//       >
//         Upload gallery images
//       </button>

//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         multiple
//         hidden
//         onChange={(e) => {
//           if (!e.target.files) return;
//           [...e.target.files].forEach(upload);
//           e.target.value = "";
//         }}
//       />

//       {/* Grid */}
//       <div className="grid grid-cols-3 gap-3">
//         {urls.map((url, idx) => (
//           <div
//             key={url}
//             draggable
//             onDragStart={() => (dragIndex.current = idx)}
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={() => {
//               if (dragIndex.current !== null) {
//                 move(dragIndex.current, idx);
//                 dragIndex.current = null;
//               }
//             }}
//             onTouchStart={() => (dragIndex.current = idx)}
//             onTouchEnd={() => (dragIndex.current = null)}
//             onTouchMove={() => {
//               if (dragIndex.current !== null && dragIndex.current !== idx) {
//                 move(dragIndex.current, idx);
//                 dragIndex.current = idx;
//               }
//             }}
//             className="relative group cursor-move"
//           >
//             <img
//               src={url}
//               onClick={() => setPreview(url)}
//               className="h-28 w-full object-cover rounded border"
//             />

//             <button
//               type="button"
//               onClick={() => remove(idx)}
//               className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100"
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>

//       {preview && (
//         <Lightbox src={preview} onClose={() => setPreview(null)} />
//       )}
//     </div>
//   );
// }
