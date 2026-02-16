"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Invalid or expired link");
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-100 dark:bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4"
      >
        <h1 className="text-lg font-semibold text-center">Reset Password</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Password updated. Redirecting to login…
          </p>
        )}

        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          type="password"
          required
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <button
          disabled={loading}
          className="w-full py-2 rounded bg-slate-900 text-white disabled:opacity-70"
        >
          {loading ? "Saving…" : "Reset Password"}
        </button>
      </form>
    </main>
  );
}
