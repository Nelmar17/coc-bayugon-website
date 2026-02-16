"use client";

import { useState } from "react";

export default function SendNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSend() {
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });

    const data = await res.json();
    setMsg(data.message || "Sent!");
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Newsletter</h1>

      {msg && <p className="mb-4 text-emerald-500">{msg}</p>}

      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full border p-2 mb-2"
      />

      <textarea
        placeholder="Email content (HTML allowed)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full border p-2 mb-2 h-48"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
