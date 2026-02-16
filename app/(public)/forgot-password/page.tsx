"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Something went wrong");
        return;
      }

      setMessage("If this email exists, a reset link has been sent.");
    } catch {
      setError("Server error. Please try again.");
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
        <h1 className="text-lg font-semibold text-center">Forgot Password</h1>

        <p className="text-sm text-slate-500 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {message}
          </p>
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <button
          disabled={loading}
          className="w-full py-2 rounded bg-slate-900 text-white disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-sm text-slate-500 hover:underline"
        >
          Back to login
        </button>
      </form>
    </main>
  );
}
