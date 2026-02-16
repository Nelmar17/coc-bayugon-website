"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function MessageThreadPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
//   const [me, setMe] = useState<any>(null);


  async function load() {
    try {
      const res = await fetch(`/api/admin/messages/${id}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Failed to load message");
    } finally {
      setLoading(false);
    }
  }

// useEffect(() => {
//   fetch("/api/users/me")
//     .then((r) => r.json())
//     .then(setMe);
// }, []);


  useEffect(() => {
    if (id) load();
  }, [id]);

  async function sendReply() {
    if (!reply.trim()) return;

    setSending(true);
    const res = await fetch(`/api/admin/messages/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });

    if (res.ok) {
      toast.success("Reply sent");
      setReply("");
      load();
    } else {
      toast.error("Reply failed");
    }
    setSending(false);
  }

  async function resolve() {
    await fetch(`/api/admin/messages/${id}/resolve`, { method: "POST" });
    toast.success("Marked as resolved");
    router.push("/admin/messages");
  }

  async function deleteMessage() {
    const res = await fetch(`/api/admin/messages/${id}/delete`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Message deleted");
      router.push("/admin/messages");
    } else {
      toast.error("Delete failed");
    }

    setConfirmDelete(false);
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Subject: {data.subject}</h1>

      <Card className="border-l-2 border-blue-500">
        <CardHeader>
          <CardTitle>
           • {data.firstName} {data.lastName}
           <p className="text-sm text-muted-foreground"> - {data.email}</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          <p>{data.message}</p>
          <p className="text-xs text-muted-foreground mt-6">
            {format(new Date(data.createdAt), "PPpp")}
          </p>
        </CardContent>
      </Card>

      {data.replies?.map((r: any) => (
        <Card
          key={r.id}
          className={`border-l-2 ${
            r.sentBy === "admin"
              ? "border-lime-700"
              : "border-blue-700"
          }`}
        >
        <CardHeader>
            <CardTitle>
                • COC {r.sentBy}
            </CardTitle>
        </CardHeader>
          <CardContent>
            <p>{r.body}</p>
            <p className="text-xs text-muted-foreground mt-6">
              {format(new Date(r.createdAt), "PPpp")} • {r.sentBy}
            </p>
          </CardContent>
        </Card>
      ))}

{/* {data.replies?.map((r: any) => {
    const isAdmin = r.sentBy === "admin";
    const displayName = isAdmin
        ? me?.name || "Admin"
        : `${data.firstName} ${data.lastName}`;

    return (
        <Card
        key={r.id}
        className={`border-l-2 ${
            isAdmin ? "border-lime-700" : "border-blue-700"
        }`}
        >
        <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
            <span
                className={`text-xs font-semibold uppercase ${
                isAdmin ? "text-lime-700" : "text-blue-700"
                }`}
            >
                {isAdmin ? "Admin Reply" : "Visitor"}
            </span>
            <span>• {displayName}</span>
            </CardTitle>
        </CardHeader>

        <CardContent>
            <p className="whitespace-pre-line">{r.body}</p>

            <p className="text-xs text-muted-foreground mt-4">
            {format(new Date(r.createdAt), "PPpp")}
            </p>
        </CardContent>
        </Card>
    );
    })} */}


      <Separator />

      <Textarea
        placeholder="Write a reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={sendReply} disabled={sending}>
          {sending ? "Sending..." : "Send Reply"}
        </Button>

        {!data.resolved && (
          <Button variant="secondary" onClick={resolve}>
            Mark as Resolved
          </Button>
        )}

        <Button
          variant="destructive"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </div>

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this message?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message and its replies.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={deleteMessage}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
