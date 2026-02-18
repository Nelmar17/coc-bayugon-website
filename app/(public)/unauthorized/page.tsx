"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  useEffect(() => {
    toast.error("Permission denied. You don’t have access to that page.");
  }, []);

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-950 p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-sm text-muted-foreground">
          You’re logged in, but your role can’t access this page.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/">
            <Button className="rounded-full bg-white dark:bg-slate-900 hover:bg-blue-100/80 dark:hover:bg-slate-950" variant="outline">Go Home</Button>
          </Link>
          <Link href="/profile">
            <Button className="rounded-full bg-blue-800 hover:bg-blue-900 dark:text-white" >My Profile</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
