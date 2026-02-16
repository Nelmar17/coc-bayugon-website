"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronsLeft,
} from "lucide-react";

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());


  useEffect(() => {
  return () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
  };
}, [avatarPreview]);


  // Profile form
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  // Password form
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  /* ------------------------------------
   * Load user on mount
   * ------------------------------------ */
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setMe(data);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
        });
      });
  }, []);

  /* ------------------------------------
   * Avatar Change Preview
   * ------------------------------------ */
  function handleAvatarChange(e: any) {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  /* ------------------------------------
   * Avatar Upload
   * ------------------------------------ */
    async function uploadAvatar() {
      if (!avatarFile) {
        toast.error("No image selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", avatarFile);

      await toast.promise(
        fetch("/api/users/upload-avatar", {
          method: "POST",
          body: formData,
        }).then(async (res) => {
          if (!res.ok) throw new Error("Upload failed");

          const data = await res.json();

          setMe((prev: any) => ({
            ...prev,
            avatarUrl: data.avatarUrl,
          }));

          // 🔥 ADD THESE
          setAvatarFile(null);
          setAvatarPreview(null);
          setAvatarVersion(Date.now());

          window.dispatchEvent(new Event("user-updated"));
        }),
        {
          loading: "Uploading avatar...",
          success: "Avatar updated!",
          error: "Upload failed",
        }
      );

    }


  /* ------------------------------------
   * Save Profile
   * ------------------------------------ */
    async function saveProfile(e: any) {
      e.preventDefault();

      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();

        setMe(updated); // update local state
        window.dispatchEvent(new Event("user-updated")); // 🔔 IMPORTANT
        toast.success("Profile saved!");
      } else {
        toast.error("Failed to save profile");
      }
    }

  /* ------------------------------------
   * Change Password
   * ------------------------------------ */
  async function changePassword(e: any) {
    e.preventDefault();

    const res = await fetch("/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });

    if (res.ok) {
      toast.success("Password changed!");
      setPasswords({ oldPassword: "", newPassword: "" });
    } else {
      toast.error("Incorrect old password");
    }
  }

  if (!me) return <p className="p-6">Loading...</p>;

  return (
 <div className="space-y-6 pb-8 bg-white dark:bg-slate-950">
        {/* HEADER */}
            <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
                style={{
                  backgroundImage: "url('/church-contact.jpg')",
                }}
              />
            <div className="absolute inset-0 bg-black/60" />

           <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-20 sm:pt-16">
              <div className="max-w-xl sm:max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    My Profile 
                  </h1>
                  <p className="pt-4 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
                    <span className="block font-semibold text-white">
                      Bayugon Church of Christ
                    </span>
                  </p>
                </div>
              </div>
            </section>
          <div className="max-w-4xl mx-auto mb-20 p-6 bg-white dark:bg-slate-950 space-y-10">
            {/* BACK TO ADMIN + GO HOME */}
          <div className="flex items-center justify-between w-full gap-2">
           {/* LEFT: Admin Dashboard */}
              {me?.role !== "viewer" && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className="
                      flex items-center gap-2
                      py-2 px-2
                      rounded-full
                      text-slate-950
                      hover:bg-blue-200
                      dark:text-slate-50
                      hover:dark:bg-blue-900
                      dark:bg-slate-950
                      text-md font-bold
                    "
                  >
                    <ChevronsLeft className="w-5 h-5" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}

              {/* RIGHT: Go Home */}
              <Link href="/">
                <Button className="rounded-full border border-blue-400 bg-slate-50 dark:bg-slate-950 hover:bg-blue-100 dark:hover:bg-blue-900" variant="outline">
                  Go Home
                </Button>
              </Link>
            </div>


          <h1 className="text-3xl font-bold">Profile Customization</h1>

      {/* ----------------------------------------------------- */}
      {/* AVATAR CARD                                           */}
      {/* ----------------------------------------------------- */}
      
      <Card className="bg-white dark:bg-slate-950 border-blue-400">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-6">
          <Avatar className="w-24 h-24 ring-2 ring-blue-500">
              <AvatarImage
                src={
                  avatarPreview ||
                  (me.avatarUrl
                    ? `${me.avatarUrl}?v=${avatarVersion}`
                    : "/default-avatar.png")
                }
              />

            <AvatarFallback>
              {me.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <Input type="file" accept="image/*" onChange={handleAvatarChange} />

            <Button
              onClick={uploadAvatar}
              disabled={!avatarFile || savingAvatar}
              className="w-40"
            >
              {savingAvatar ? "Uploading..." : "Save Avatar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------- */}
      {/*             PROFILE INFORMATION CARD                  */}
      {/* ----------------------------------------------------- */}
      <Card className="bg-white dark:bg-slate-950 border-blue-400">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <Button type="submit" className="rounded-full mt-2 bg-blue-900 dark:text-white dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------- */}
      {/* CHANGE PASSWORD CARD                                  */}
      {/* ----------------------------------------------------- */}
      <Card className="bg-white dark:bg-slate-950 border-blue-400">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={changePassword}>
            <div>
              <Label>Old Password</Label>
              <Input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    oldPassword: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <Button variant="destructive" type="submit" className="rounded-full bg-red-600 hover:bg-red-500">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
