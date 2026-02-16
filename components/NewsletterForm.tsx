"use client";

import { useState } from "react";

export function NewsletterForm() {
  
  if (process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED !== "true") {
    return null; // 🔒 hidden
  }

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    const data = await res.json();
    setMsg(data.message);

    if (res.ok) {
      setEmail("");
      setName("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-sm">
      <p className="font-semibold">Subscribe to Newsletter</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        className="w-full rounded border px-3 py-1 text-black"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full rounded border px-3 py-1 text-black"
        required
      />

      <button className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-black">
        Subscribe
      </button>

      {msg && <p className="text-xs text-emerald-300">{msg}</p>}
    </form>
  );
}
