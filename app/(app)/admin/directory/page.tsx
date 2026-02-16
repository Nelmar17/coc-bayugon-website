"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminMapPicker from "@/components/AdminMapPicker";
import GalleryManager from "@/components/GalleryManager";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploadButton from "@/components/ImageUploadButton";

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */
type DirectoryItem = {
  id: number;
  congregationName: string;
  region: "north" | "south" | "other";
  location: string;
  address: string;
  preacherName: string;
  contactNumber: string;
  email: string;
  website?: string | null;

  worshipTimes?: string | null;
  elders?: string | null;

  mainPhoto?: string | null;
  mainPhotoId?: string | null;

  gallery: string[];
  galleryIds: string[];

  latitude?: number | null;
  longitude?: number | null;

  welcomeMessage?: string | null;
  bibleVerse?: string | null;
  bibleRef?: string | null;

  createdAt?: string;
};

type DirectoryForm = {
  congregationName: string;
  region: "north" | "south" | "other";
  location: string;
  address: string;
  preacherName: string;
  contactNumber: string;
  email: string;
  website: string;

  worshipTimes: string;
  elders: string;

  mainPhoto: string;
  mainPhotoId: string;

  gallery: string[];
  galleryIds: string[];

  latitude: number | null;
  longitude: number | null;

  welcomeMessage: string;
  bibleVerse: string;
  bibleRef: string;
};

const emptyForm: DirectoryForm = {
  congregationName: "",
  region: "other",
  location: "",
  address: "",
  preacherName: "",
  contactNumber: "",
  email: "",
  website: "",

  worshipTimes: "",
  elders: "",

  mainPhoto: "",
  mainPhotoId: "",

  gallery: [],
  galleryIds: [],

  latitude: null,
  longitude: null,

  welcomeMessage: "We are glad you are here.",
  bibleVerse:
    "Come to me, all who labor and are heavy laden, and I will give you rest.",
  bibleRef: "Matthew 11:28",
};

type WizardStep = 0 | 1 | 2 | 3;

export default function AdminDirectoryPage() {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DirectoryItem | null>(null);

  const [form, setForm] = useState<DirectoryForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  // const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [removedGalleryIds, setRemovedGalleryIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<DirectoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);


  // ✅ Wizard UI state (UI-only)
  const [step, setStep] = useState<WizardStep>(0);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/directory", { cache: "no-store" });
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setRemovedGalleryIds([]);
    setStep(0);
    setDialogOpen(true);
  }

  function openEdit(item: DirectoryItem) {
    setEditing(item);
    setRemovedGalleryIds([]);
    setForm({
      congregationName: item.congregationName,
      region: item.region,
      location: item.location,
      address: item.address,
      preacherName: item.preacherName,
      contactNumber: item.contactNumber,
      email: item.email,
      website: item.website ?? "",

      worshipTimes: item.worshipTimes ?? "",
      elders: item.elders ?? "",

      mainPhoto: item.mainPhoto ?? "",
      mainPhotoId: item.mainPhotoId ?? "",

      gallery: item.gallery ?? [],
      galleryIds: item.galleryIds ?? [],

      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,

      welcomeMessage: item.welcomeMessage ?? "We are glad you are here.",
      bibleVerse:
        item.bibleVerse ??
        "Come to me, all who labor and are heavy laden, and I will give you rest.",
      bibleRef: item.bibleRef ?? "Matthew 11:28",
    });
    setStep(0);
    setDialogOpen(true);
  }


  async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
      ) {
        e.preventDefault();
        setSaving(true);

        const toastId = toast.loading(
          editing ? "Saving changes..." : "Creating congregation..."
        );

        try {
          const method = editing ? "PUT" : "POST";
          const url = editing
            ? `/api/directory/${editing.id}`
            : "/api/directory";

          const payload = {
            ...form,
            worshipTimes: form.worshipTimes || null,
            elders: form.elders || null,
            website: form.website || null,
            mainPhoto: form.mainPhoto || null,
            mainPhotoId: form.mainPhotoId || null,
            welcomeMessage: form.welcomeMessage || null,
            bibleVerse: form.bibleVerse || null,
            bibleRef: form.bibleRef || null,
            removedGalleryIds: editing ? removedGalleryIds : [],
          };

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error("Failed to save");
          }

          toast.success(
            editing ? "Congregation updated" : "Congregation created",
            { id: toastId }
          );

          setDialogOpen(false);
          setEditing(null);
          setStep(0);
          await load();
        } catch (err) {
          console.error(err);
          toast.error("Failed to save congregation", { id: toastId });
        } finally {
          setSaving(false);
        }
      }


  // async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   setSaving(true);

  //   try {
  //     const method = editing ? "PUT" : "POST";
  //     const url = editing ? `/api/directory/${editing.id}` : "/api/directory";

  //     const payload = {
  //       ...form,
  //       website: form.website || null,
  //       mainPhoto: form.mainPhoto || null,
  //       mainPhotoId: form.mainPhotoId || null,
  //       welcomeMessage: form.welcomeMessage || null,
  //       bibleVerse: form.bibleVerse || null,
  //       bibleRef: form.bibleRef || null,
  //       removedGalleryIds: editing ? removedGalleryIds : [],
  //     };

  //     const res = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       alert("Failed to save");
  //       return;
  //     }

  //     setDialogOpen(false);
  //     setEditing(null);
  //     setStep(0);
  //     await load();
  //   } finally {
  //     setSaving(false);
  //   }
  // }


   // 🔒 Final validation
   function handleFinalSubmit() {      
      // 🔴 REQUIRED FIELDS
      if (!form.congregationName.trim()) {
        toast.error("Congregation name is required.");
        setStep(0);
        return;
      }

      if (!form.location.trim()) {
        toast.error("Location is required.");
        setStep(0);
        return;
      }

      // 🟡 OPTIONAL WARNINGS
      if (!form.preacherName.trim()) {
        toast.warning("Preacher name is empty. You can add it later.");
      }

      if (!editing && form.gallery.length === 0) {
        toast.warning("No photos added. You can upload them later.");
      }

      // ✅ FINAL SUBMIT
      const fakeEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;

      handleSubmit(fakeEvent);
    }

  
  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting congregation...");

    try {
      const res = await fetch(`/api/directory/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Congregation deleted", { id: toastId });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete congregation", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }

  // async function handleDelete(id: number) {
  //   if (!confirm("Delete this congregation?")) return;
  //   setDeletingId(id);
  //   try {
  //     const res = await fetch(`/api/directory/${id}`, { method: "DELETE" });
  //     if (!res.ok) {
  //       alert("Failed to delete");
  //       return;
  //     }
  //     await load();
  //   } finally {
  //     setDeletingId(null);
  //   }
  // }

  const filteredItems = useMemo(() => {
    return items.filter((i) =>
      i.congregationName.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selected.length === filteredItems.length) {
      setSelected([]);
    } else {
      setSelected(filteredItems.map((i) => i.id));
    }
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;

    if (!confirm(`Delete ${selected.length} congregations?`)) return;

    try {
      await Promise.all(
        selected.map((id) => fetch(`/api/directory/${id}`, { method: "DELETE" }))
      );

      setSelected([]);
      await load();
    } catch (err) {
      alert("Bulk delete failed");
    }
  }

  // ✅ Simple step validations (UI-only; hindi hinaharangan API payload mo)
  const stepCanNext = useMemo(() => {
    if (step === 0) {
      return (
        form.congregationName.trim().length > 0 &&
        form.location.trim().length > 0
      );
    }
    if (step === 1) {
      return true; // location optional
    }
    if (step === 2) {
      return true; // media optional
    }
    return true;
  }, [step, form]);


  const stepTitles = [
    "Basic Info",
    "Location",
    "Media",
    "Contact & Messages",
  ] as const;


    function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setStep(0);
    setForm(emptyForm);
    setRemovedGalleryIds([]);
  }

  // function closeDialog() {
  //   setDialogOpen(false);
  //   setEditing(null);
  //   setStep(0);
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Directory</h2>
          <p className="text-sm text-slate-500">Manage congregations.</p>
        </div>
         
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
                <Button
                  onClick={openCreate}
                  className="
                    bg-blue-800 text-white
                    hover:bg-blue-600
                    dark:bg-blue-600 dark:text-slate-200
                    dark:hover:bg-blue-500
                    transition-colors duration-200
                  "
                >
                  Add Congregation
                </Button>
              </DialogTrigger>

          {/* ✅ Unified with Events style: no full-height mobile hijack */}
          <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Congregation" : "Add Congregation"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details of this congregation."
                  : "Fill out the form to add a new congregation."}
              </DialogDescription>
            </DialogHeader>

            {/* Wizard header */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  Step {step + 1} of {stepTitles.length}:{" "}
                  <span className="font-medium text-slate-900">
                    {stepTitles[step]}
                  </span>
                </div>

                {/* Step dots */}
                <div className="flex items-center gap-2">
                  {stepTitles.map((_, idx) => {
                    const active = idx === step;
                    const done = idx < step;
                    return (
                      <div
                        key={idx}
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          done
                            ? "bg-slate-900"
                            : active
                            ? "bg-slate-600"
                            : "bg-slate-200",
                        ].join(" ")}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-slate-200" />
            </div>

            {/* <form onSubmit={handleSubmit} className="space-y-6 pt-2"> */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 pt-2" >
              {/* ✅ Step content */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Congregation Name</Label>
                      <Input
                        value={form.congregationName}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            congregationName: e.target.value,
                          }))
                        }
                        required
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Region</Label>
                      <select
                        value={form.region}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            region: e.target.value as any,
                          }))
                        }
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="north">North Palawan</option>
                        <option value="south">South Palawan</option>
                        <option value="other">Other Region</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={form.location}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, location: e.target.value }))
                        }
                        required
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Full Address</Label>
                      <Textarea
                        rows={4}
                        value={form.address}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, address: e.target.value }))
                        }
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Website (optional)</Label>
                      <Input
                        value={form.website}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, website: e.target.value }))
                        }
                        placeholder="https://..."
                        className="text-base"
                      />
                    </div>

                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Preacher Name</Label>
                        <Input
                          value={form.preacherName}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              preacherName: e.target.value,
                            }))
                          }
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <Input
                          value={form.contactNumber}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              contactNumber: e.target.value,
                            }))
                          }
                          className="text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className="text-base"
                      />
                    </div>
                 <div className="space-y-2">
                     <Label>Elders (optional)</Label>
                    <Input
                      placeholder="John Doe, Peter Cruz"
                      value={form.elders}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, elders: e.target.value }))
                      }
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Worship Times (optional)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Sunday 9:00 AM\nWednesday 7:00 PM"
                      value={form.worshipTimes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, worshipTimes: e.target.value }))
                      }
                      className="text-base"
                    />
                  </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pick location on map</Label>
                      <AdminMapPicker
                        latitude={form.latitude}
                        longitude={form.longitude}
                        onChange={(lat, lng) =>
                          setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
                        }
                      />
                    </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              latitude: null,
                              longitude: null,
                            }))
                          }
                        >
                          Clear pin
                        </Button>                   
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={form.latitude ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              latitude: e.target.value
                                ? Number(e.target.value)
                                : null,
                            }))
                          }
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={form.longitude ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              longitude: e.target.value
                                ? Number(e.target.value)
                                : null,
                            }))
                          }
                          className="text-base"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 text-sm text-slate-600">
                      Tip: You can either click the map or manually input
                      latitude/longitude.
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Main Photo</Label>
                      <ImageUploadButton
                        onUploaded={({ url, public_id }: any) =>
                          setForm((f) => ({
                            ...f,
                            mainPhoto: url,
                            mainPhotoId: public_id,
                          }))
                        }
                      />
                      {form.mainPhoto && (
                        <img
                          src={form.mainPhoto}
                          className="h-48 w-full object-cover rounded"
                          alt="Main"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Gallery (drag to reorder, X to delete)</Label>
                      <GalleryManager
                        urls={form.gallery}
                        ids={form.galleryIds}
                        onChange={(gallery, galleryIds) =>
                          setForm((f) => ({ ...f, gallery, galleryIds }))
                        }
                      />
                    </div>

                    <div className="rounded-lg border p-4 text-sm text-slate-600">
                      Note: If you're editing, removed gallery items will be
                      tracked via <code>removedGalleryIds</code> (unchanged logic).
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Welcome Message</Label>
                      <Textarea
                        rows={4}
                        value={form.welcomeMessage}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            welcomeMessage: e.target.value,
                          }))
                        }
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bible Verse</Label>
                      <Textarea
                        rows={4}
                        value={form.bibleVerse}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, bibleVerse: e.target.value }))
                        }
                        className="text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reference</Label>
                      <Input
                        value={form.bibleRef}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, bibleRef: e.target.value }))
                        }
                        placeholder="Matthew 11:28"
                        className="text-base"
                      />
                    </div>

                    {/* <div className="rounded-lg border p-4 text-sm">
                      <p><b>Congregation:</b> {form.congregationName}</p>
                      <p><b>Location:</b> {form.location}</p>
                      <p><b>Preacher:</b> {form.preacherName || "—"}</p>
                    </div> */}

                    <div className="rounded-lg border p-4 text-sm text-slate-600">
                      Review everything, then click{" "}
                      <span className="font-medium text-slate-900">
                        {editing ? "Save Changes" : "Create"}
                      </span>
                      .
                    </div>
                  </div>

                </div>
              )}

              {/* ✅ Unified footer (like Events), plus wizard controls */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4 border-t">
                  {/* LEFT: Cancel */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  {/* RIGHT: Navigation */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    {/* BACK */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((s) => (s > 0 ? ((s - 1) as WizardStep) : s))}
                      disabled={step === 0 || saving}
                    >
                      Back
                    </Button>

                    {/* NEXT / FINAL */}
                    {step < stepTitles.length - 1 ? (
                      <Button
                        type="button"
                        onClick={() => setStep((s) => ((s + 1) as WizardStep))}
                        disabled={!stepCanNext}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleFinalSubmit}
                        disabled={saving}
                        className="bg-blue-700 hover:bg-blue-600 text-white"
                      >
                        {saving
                          ? "Saving..."
                          : editing
                          ? "Save Changes"
                          : "Create Congregation"}
                      </Button>
                    )}
                  </div>
                </div>


              {/* <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditing(null);
                        setStep(0);
                      }}
                    >
                      Cancel
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={step === 0}
                        onClick={() => setStep((s) => (s - 1) as WizardStep)}
                      >
                        Back
                      </Button>

                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={() => setStep((s) => (s + 1) as WizardStep)}
                        >
                          Next
                        </Button>
                      ) : (
                       <Button
                            type="button"
                            disabled={saving}
                            onClick={() => handleFinalSubmit()}
                          >
                            {saving
                              ? "Saving..."
                              : editing
                              ? "Save Changes"
                              : "Create"}
                          </Button>

                      )}
                    </div>
                  </div> */}

              {/* <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => (s > 0 ? ((s - 1) as WizardStep) : s))}
                    disabled={step === 0}
                  >
                    Back
                  </Button>

                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setStep((s) => ((s + 1) as WizardStep))}
                      disabled={!stepCanNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                    type="button"
                    // onClick={handleSubmit}
                     onClick={() => handleFinalSubmit()}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                  </Button>

                  )}
                </div>
              </div> */}


            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Search congregation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Congregations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-slate-500">No congregations yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Bulk actions */}
              {selected.length > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-600">
                    {selected.length} selected
                  </p>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                </div>
              )}

              {/* ✅ MOBILE: Card view */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-semibold leading-tight">
                            {item.congregationName}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {item.createdAt
                              ? format(new Date(item.createdAt), "MMM d, yyyy")
                              : "-"}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs px-2 py-1 rounded-full border capitalize">
                        {item.region}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-slate-500">Location: </span>
                        <span>{item.location || "-"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Preacher: </span>
                        <span>{item.preacherName || "-"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                       <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(item)}
                        disabled={deleting && deleteTarget?.id === item.id}
                      >
                        {deleting && deleteTarget?.id === item.id ? "Deleting..." : "Delete"}
                      </Button>

                      {/* <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </Button> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ DESKTOP: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={
                            filteredItems.length > 0 &&
                            selected.length === filteredItems.length
                          }
                          onChange={toggleSelectAll}
                        />
                      </TableHead>

                      <TableHead>Congregation</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Preacher
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="text-right w-[180px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </TableCell>

                        <TableCell className="font-medium">
                          {item.congregationName}
                        </TableCell>

                        <TableCell className="capitalize">{item.region}</TableCell>
                        <TableCell>{item.location}</TableCell>

                        <TableCell className="hidden lg:table-cell">
                          {item.preacherName}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                          {item.createdAt
                            ? format(new Date(item.createdAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(item)}
                              disabled={deleting && deleteTarget?.id === item.id}
                            >
                              {deleting && deleteTarget?.id === item.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete congregation?"
          description="This will permanently remove this congregation and its media."
          destructiveLabel={deleteTarget?.congregationName}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}




// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { format } from "date-fns";
// import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
// import { toast } from "sonner";


// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import AdminMapPicker from "@/components/AdminMapPicker";
// import GalleryManager from "@/components/GalleryManager";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import ImageUploadButton from "@/components/ImageUploadButton";

// /* ---------------------------------------------
//  * Types
//  * -------------------------------------------- */
// type DirectoryItem = {
//   id: number;
//   congregationName: string;
//   region: "north" | "south" | "other";
//   location: string;
//   address: string;
//   preacherName: string;
//   contactNumber: string;
//   email: string;
//   website?: string | null;

//   mainPhoto?: string | null;
//   mainPhotoId?: string | null;

//   gallery: string[];
//   galleryIds: string[];

//   latitude?: number | null;
//   longitude?: number | null;

//   welcomeMessage?: string | null;
//   bibleVerse?: string | null;
//   bibleRef?: string | null;

//   createdAt?: string;
// };

// type DirectoryForm = {
//   congregationName: string;
//   region: "north" | "south" | "other";
//   location: string;
//   address: string;
//   preacherName: string;
//   contactNumber: string;
//   email: string;
//   website: string;

//   mainPhoto: string;
//   mainPhotoId: string;

//   gallery: string[];
//   galleryIds: string[];

//   latitude: number | null;
//   longitude: number | null;

//   welcomeMessage: string;
//   bibleVerse: string;
//   bibleRef: string;
// };

// const emptyForm: DirectoryForm = {
//   congregationName: "",
//   region: "other",
//   location: "",
//   address: "",
//   preacherName: "",
//   contactNumber: "",
//   email: "",
//   website: "",

//   mainPhoto: "",
//   mainPhotoId: "",

//   gallery: [],
//   galleryIds: [],

//   latitude: null,
//   longitude: null,

//   welcomeMessage: "We are glad you are here.",
//   bibleVerse:
//     "Come to me, all who labor and are heavy laden, and I will give you rest.",
//   bibleRef: "Matthew 11:28",
// };

// type WizardStep = 0 | 1 | 2 | 3;

// export default function AdminDirectoryPage() {
//   const [items, setItems] = useState<DirectoryItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<DirectoryItem | null>(null);

//   const [form, setForm] = useState<DirectoryForm>(emptyForm);

//   const [saving, setSaving] = useState(false);
//   // const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [search, setSearch] = useState("");
//   const [removedGalleryIds, setRemovedGalleryIds] = useState<string[]>([]);
//   const [selected, setSelected] = useState<number[]>([]);

//   const [deleteTarget, setDeleteTarget] = useState<DirectoryItem | null>(null);
//   const [deleting, setDeleting] = useState(false);


//   // ✅ Wizard UI state (UI-only)
//   const [step, setStep] = useState<WizardStep>(0);

//   async function load() {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/directory", { cache: "no-store" });
//       const data = await res.json();
//       setItems(data);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   function openCreate() {
//     setEditing(null);
//     setForm(emptyForm);
//     setRemovedGalleryIds([]);
//     setStep(0);
//     setDialogOpen(true);
//   }

//   function openEdit(item: DirectoryItem) {
//     setEditing(item);
//     setRemovedGalleryIds([]);
//     setForm({
//       congregationName: item.congregationName,
//       region: item.region,
//       location: item.location,
//       address: item.address,
//       preacherName: item.preacherName,
//       contactNumber: item.contactNumber,
//       email: item.email,
//       website: item.website ?? "",

//       mainPhoto: item.mainPhoto ?? "",
//       mainPhotoId: item.mainPhotoId ?? "",

//       gallery: item.gallery ?? [],
//       galleryIds: item.galleryIds ?? [],

//       latitude: item.latitude ?? null,
//       longitude: item.longitude ?? null,

//       welcomeMessage: item.welcomeMessage ?? "We are glad you are here.",
//       bibleVerse:
//         item.bibleVerse ??
//         "Come to me, all who labor and are heavy laden, and I will give you rest.",
//       bibleRef: item.bibleRef ?? "Matthew 11:28",
//     });
//     setStep(0);
//     setDialogOpen(true);
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const method = editing ? "PUT" : "POST";
//       const url = editing ? `/api/directory/${editing.id}` : "/api/directory";

//       const payload = {
//         ...form,
//         website: form.website || null,
//         mainPhoto: form.mainPhoto || null,
//         mainPhotoId: form.mainPhotoId || null,
//         welcomeMessage: form.welcomeMessage || null,
//         bibleVerse: form.bibleVerse || null,
//         bibleRef: form.bibleRef || null,
//         removedGalleryIds: editing ? removedGalleryIds : [],
//       };

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         alert("Failed to save");
//         return;
//       }

//       setDialogOpen(false);
//       setEditing(null);
//       setStep(0);
//       await load();
//     } finally {
//       setSaving(false);
//     }
//   }
  
//   async function handleDeleteConfirmed() {
//     if (!deleteTarget) return;

//     setDeleting(true);
//     const toastId = toast.loading("Deleting congregation...");

//     try {
//       const res = await fetch(`/api/directory/${deleteTarget.id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) {
//         throw new Error(await res.text());
//       }

//       toast.success("Congregation deleted", { id: toastId });
//       setDeleteTarget(null);
//       await load();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete congregation", { id: toastId });
//     } finally {
//       setDeleting(false);
//     }
//   }

//   // async function handleDelete(id: number) {
//   //   if (!confirm("Delete this congregation?")) return;
//   //   setDeletingId(id);
//   //   try {
//   //     const res = await fetch(`/api/directory/${id}`, { method: "DELETE" });
//   //     if (!res.ok) {
//   //       alert("Failed to delete");
//   //       return;
//   //     }
//   //     await load();
//   //   } finally {
//   //     setDeletingId(null);
//   //   }
//   // }

//   const filteredItems = useMemo(() => {
//     return items.filter((i) =>
//       i.congregationName.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [items, search]);

//   function toggleSelect(id: number) {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   }

//   function toggleSelectAll() {
//     if (selected.length === filteredItems.length) {
//       setSelected([]);
//     } else {
//       setSelected(filteredItems.map((i) => i.id));
//     }
//   }

//   async function handleBulkDelete() {
//     if (selected.length === 0) return;

//     if (!confirm(`Delete ${selected.length} congregations?`)) return;

//     try {
//       await Promise.all(
//         selected.map((id) => fetch(`/api/directory/${id}`, { method: "DELETE" }))
//       );

//       setSelected([]);
//       await load();
//     } catch (err) {
//       alert("Bulk delete failed");
//     }
//   }

//   // ✅ Simple step validations (UI-only; hindi hinaharangan API payload mo)
//   const stepCanNext = useMemo(() => {
//     if (step === 0) {
//       return (
//         form.congregationName.trim().length > 0 &&
//         form.location.trim().length > 0
//       );
//     }
//     if (step === 1) {
//       return true;
//     }
//     if (step === 2) {
//       return true;
//     }
//     return true;
//   }, [step, form]);

//   const stepTitles = [
//     "Basic Info",
//     "Location",
//     "Media",
//     "Contact & Messages",
//   ] as const;

//   function closeDialog() {
//     setDialogOpen(false);
//     setEditing(null);
//     setStep(0);
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Directory</h2>
//           <p className="text-sm text-slate-500">Manage congregations.</p>
//         </div>
         
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//                 <Button
//                   onClick={openCreate}
//                   className="
//                     bg-blue-800 text-white
//                     hover:bg-blue-600
//                     dark:bg-blue-600 dark:text-slate-200
//                     dark:hover:bg-blue-500
//                     transition-colors duration-200
//                   "
//                 >
//                   Add Congregation
//                 </Button>
//               </DialogTrigger>

//           {/* ✅ Unified with Events style: no full-height mobile hijack */}
//           <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>
//                 {editing ? "Edit Congregation" : "Add Congregation"}
//               </DialogTitle>
//             </DialogHeader>

//             {/* Wizard header */}
//             <div className="space-y-3">
//               <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="text-sm text-slate-600">
//                   Step {step + 1} of {stepTitles.length}:{" "}
//                   <span className="font-medium text-slate-900">
//                     {stepTitles[step]}
//                   </span>
//                 </div>

//                 {/* Step dots */}
//                 <div className="flex items-center gap-2">
//                   {stepTitles.map((_, idx) => {
//                     const active = idx === step;
//                     const done = idx < step;
//                     return (
//                       <div
//                         key={idx}
//                         className={[
//                           "h-2.5 w-2.5 rounded-full",
//                           done
//                             ? "bg-slate-900"
//                             : active
//                             ? "bg-slate-600"
//                             : "bg-slate-200",
//                         ].join(" ")}
//                       />
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="h-px bg-slate-200" />
//             </div>

//             <form onSubmit={(e) => { e.preventDefault();}} className="space-y-6 pt-2">
//               {/* ✅ Step content */}
//               {step === 0 && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Congregation Name</Label>
//                       <Input
//                         value={form.congregationName}
//                         onChange={(e) =>
//                           setForm((f) => ({
//                             ...f,
//                             congregationName: e.target.value,
//                           }))
//                         }
//                         required
//                         className="text-base"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Region</Label>
//                       <select
//                         value={form.region}
//                         onChange={(e) =>
//                           setForm((f) => ({
//                             ...f,
//                             region: e.target.value as any,
//                           }))
//                         }
//                         className="w-full border rounded px-3 py-2 text-sm"
//                       >
//                         <option value="north">North Palawan</option>
//                         <option value="south">South Palawan</option>
//                         <option value="other">Other Congregations</option>
//                       </select>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Location</Label>
//                       <Input
//                         value={form.location}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, location: e.target.value }))
//                         }
//                         required
//                         className="text-base"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Address</Label>
//                       <Textarea
//                         rows={4}
//                         value={form.address}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, address: e.target.value }))
//                         }
//                         className="text-base"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div className="space-y-2">
//                         <Label>Preacher Name</Label>
//                         <Input
//                           value={form.preacherName}
//                           onChange={(e) =>
//                             setForm((f) => ({
//                               ...f,
//                               preacherName: e.target.value,
//                             }))
//                           }
//                           className="text-base"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label>Contact Number</Label>
//                         <Input
//                           value={form.contactNumber}
//                           onChange={(e) =>
//                             setForm((f) => ({
//                               ...f,
//                               contactNumber: e.target.value,
//                             }))
//                           }
//                           className="text-base"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Email</Label>
//                       <Input
//                         type="email"
//                         value={form.email}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, email: e.target.value }))
//                         }
//                         className="text-base"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Website (optional)</Label>
//                       <Input
//                         value={form.website}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, website: e.target.value }))
//                         }
//                         placeholder="https://..."
//                         className="text-base"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {step === 1 && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Pick location on map</Label>
//                       <AdminMapPicker
//                         latitude={form.latitude}
//                         longitude={form.longitude}
//                         onChange={(lat, lng) =>
//                           setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
//                         }
//                       />
//                     </div>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           onClick={() =>
//                             setForm((f) => ({
//                               ...f,
//                               latitude: null,
//                               longitude: null,
//                             }))
//                           }
//                         >
//                           Clear pin
//                         </Button>                   
//                   </div>

//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div className="space-y-2">
//                         <Label>Latitude</Label>
//                         <Input
//                           type="number"
//                           step="any"
//                           value={form.latitude ?? ""}
//                           onChange={(e) =>
//                             setForm((f) => ({
//                               ...f,
//                               latitude: e.target.value
//                                 ? Number(e.target.value)
//                                 : null,
//                             }))
//                           }
//                           className="text-base"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label>Longitude</Label>
//                         <Input
//                           type="number"
//                           step="any"
//                           value={form.longitude ?? ""}
//                           onChange={(e) =>
//                             setForm((f) => ({
//                               ...f,
//                               longitude: e.target.value
//                                 ? Number(e.target.value)
//                                 : null,
//                             }))
//                           }
//                           className="text-base"
//                         />
//                       </div>
//                     </div>

//                     <div className="rounded-lg border p-4 text-sm text-slate-600">
//                       Tip: You can either click the map or manually input
//                       latitude/longitude.
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {step === 2 && (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Main Photo</Label>
//                       <ImageUploadButton
//                         onUploaded={({ url, public_id }: any) =>
//                           setForm((f) => ({
//                             ...f,
//                             mainPhoto: url,
//                             mainPhotoId: public_id,
//                           }))
//                         }
//                       />
//                       {form.mainPhoto && (
//                         <img
//                           src={form.mainPhoto}
//                           className="h-48 w-full object-cover rounded"
//                           alt="Main"
//                         />
//                       )}
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Gallery (drag to reorder, X to delete)</Label>
//                       <GalleryManager
//                         urls={form.gallery}
//                         ids={form.galleryIds}
//                         onChange={(gallery, galleryIds) =>
//                           setForm((f) => ({ ...f, gallery, galleryIds }))
//                         }
//                       />
//                     </div>

//                     <div className="rounded-lg border p-4 text-sm text-slate-600">
//                       Note: If you're editing, removed gallery items will be
//                       tracked via <code>removedGalleryIds</code> (unchanged logic).
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {step === 3 && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Welcome Message</Label>
//                       <Textarea
//                         rows={4}
//                         value={form.welcomeMessage}
//                         onChange={(e) =>
//                           setForm((f) => ({
//                             ...f,
//                             welcomeMessage: e.target.value,
//                           }))
//                         }
//                         className="text-base"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label>Bible Verse</Label>
//                       <Textarea
//                         rows={4}
//                         value={form.bibleVerse}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, bibleVerse: e.target.value }))
//                         }
//                         className="text-base"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label>Reference</Label>
//                       <Input
//                         value={form.bibleRef}
//                         onChange={(e) =>
//                           setForm((f) => ({ ...f, bibleRef: e.target.value }))
//                         }
//                         placeholder="Matthew 11:28"
//                         className="text-base"
//                       />
//                     </div>

//                     <div className="rounded-lg border p-4 text-sm text-slate-600">
//                       Review everything, then click{" "}
//                       <span className="font-medium text-slate-900">
//                         {editing ? "Save Changes" : "Create"}
//                       </span>
//                       .
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* ✅ Unified footer (like Events), plus wizard controls */}

//               <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         setDialogOpen(false);
//                         setEditing(null);
//                         setStep(0);
//                       }}
//                     >
//                       Cancel
//                     </Button>

//                     <div className="flex gap-2">
//                       <Button
//                         type="button"
//                         variant="outline"
//                         disabled={step === 0}
//                         onClick={() => setStep((s) => (s - 1) as WizardStep)}
//                       >
//                         Back
//                       </Button>

//                       {step < 3 ? (
//                         <Button
//                           type="button"
//                           onClick={() => setStep((s) => (s + 1) as WizardStep)}
//                         >
//                           Next
//                         </Button>
//                       ) : (
//                         <Button
//                           type="button"
//                           onClick={handleSubmit}
//                           disabled={saving}
//                         >
//                           {saving
//                             ? "Saving..."
//                             : editing
//                             ? "Save Changes"
//                             : "Create"}
//                         </Button>
//                       )}
//                     </div>
//                   </div>

//               {/* <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
//                 <div className="flex gap-2">
//                   <Button type="button" variant="outline" onClick={closeDialog}>
//                     Cancel
//                   </Button>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setStep((s) => (s > 0 ? ((s - 1) as WizardStep) : s))}
//                     disabled={step === 0}
//                   >
//                     Back
//                   </Button>

//                   {step < 3 ? (
//                     <Button
//                       type="button"
//                       onClick={() => setStep((s) => ((s + 1) as WizardStep))}
//                       disabled={!stepCanNext}
//                     >
//                       Next
//                     </Button>
//                   ) : (
//                <Button
//                     type="button"
//                     onClick={handleSubmit}
//                     disabled={saving}
//                   >
//                     {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
//                   </Button>

//                   )}
//                 </div>
//               </div> */}
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Search */}
//       <div className="flex items-center gap-2 mb-3">
//         <Input
//           placeholder="Search congregation..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="max-w-sm"
//         />
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Congregations</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p className="text-sm text-slate-500">Loading...</p>
//           ) : filteredItems.length === 0 ? (
//             <p className="text-sm text-slate-500">No congregations yet.</p>
//           ) : (
//             <div className="space-y-4">
//               {/* Bulk actions */}
//               {selected.length > 0 && (
//                 <div className="flex items-center justify-between gap-2">
//                   <p className="text-sm text-slate-600">
//                     {selected.length} selected
//                   </p>

//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     onClick={handleBulkDelete}
//                   >
//                     Delete Selected
//                   </Button>
//                 </div>
//               )}

//               {/* ✅ MOBILE: Card view */}
//               <div className="grid grid-cols-1 gap-3 md:hidden">
//                 {filteredItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="rounded-lg border p-4 space-y-3"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex items-start gap-3">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(item.id)}
//                           onChange={() => toggleSelect(item.id)}
//                           className="mt-1"
//                         />
//                         <div>
//                           <div className="font-semibold leading-tight">
//                             {item.congregationName}
//                           </div>
//                           <div className="text-xs text-slate-500 mt-1">
//                             {item.createdAt
//                               ? format(new Date(item.createdAt), "MMM d, yyyy")
//                               : "-"}
//                           </div>
//                         </div>
//                       </div>

//                       <span className="text-xs px-2 py-1 rounded-full border capitalize">
//                         {item.region}
//                       </span>
//                     </div>

//                     <div className="text-sm space-y-1">
//                       <div>
//                         <span className="text-slate-500">Location: </span>
//                         <span>{item.location || "-"}</span>
//                       </div>
//                       <div>
//                         <span className="text-slate-500">Preacher: </span>
//                         <span>{item.preacherName || "-"}</span>
//                       </div>
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => openEdit(item)}
//                       >
//                         Edit
//                       </Button>
//                        <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => setDeleteTarget(item)}
//                         disabled={deleting && deleteTarget?.id === item.id}
//                       >
//                         {deleting && deleteTarget?.id === item.id ? "Deleting..." : "Delete"}
//                       </Button>

//                       {/* <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => handleDelete(item.id)}
//                         disabled={deletingId === item.id}
//                       >
//                         {deletingId === item.id ? "Deleting..." : "Delete"}
//                       </Button> */}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* ✅ DESKTOP: Table view */}
//               <div className="hidden md:block overflow-x-auto">
//                 <Table className="min-w-[980px]">
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-[40px]">
//                         <input
//                           type="checkbox"
//                           checked={
//                             filteredItems.length > 0 &&
//                             selected.length === filteredItems.length
//                           }
//                           onChange={toggleSelectAll}
//                         />
//                       </TableHead>

//                       <TableHead>Congregation</TableHead>
//                       <TableHead>Region</TableHead>
//                       <TableHead>Location</TableHead>
//                       <TableHead className="hidden lg:table-cell">
//                         Preacher
//                       </TableHead>
//                       <TableHead className="hidden lg:table-cell">
//                         Created
//                       </TableHead>
//                       <TableHead className="text-right w-[180px]">
//                         Actions
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {filteredItems.map((item) => (
//                       <TableRow key={item.id}>
//                         <TableCell>
//                           <input
//                             type="checkbox"
//                             checked={selected.includes(item.id)}
//                             onChange={() => toggleSelect(item.id)}
//                           />
//                         </TableCell>

//                         <TableCell className="font-medium">
//                           {item.congregationName}
//                         </TableCell>

//                         <TableCell className="capitalize">{item.region}</TableCell>
//                         <TableCell>{item.location}</TableCell>

//                         <TableCell className="hidden lg:table-cell">
//                           {item.preacherName}
//                         </TableCell>

//                         <TableCell className="hidden lg:table-cell text-xs text-slate-500">
//                           {item.createdAt
//                             ? format(new Date(item.createdAt), "MMM d, yyyy")
//                             : "-"}
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => openEdit(item)}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="destructive"
//                               onClick={() => setDeleteTarget(item)}
//                               disabled={deleting && deleteTarget?.id === item.id}
//                             >
//                               {deleting && deleteTarget?.id === item.id ? "Deleting..." : "Delete"}
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//       <ConfirmDeleteDialog
//           open={!!deleteTarget}
//           loading={deleting}
//           title="Delete congregation?"
//           description="This will permanently remove this congregation and its media."
//           destructiveLabel={deleteTarget?.congregationName}
//           onConfirm={handleDeleteConfirmed}
//           onCancel={() => setDeleteTarget(null)}
//         />
//     </div>
//   );
// }
