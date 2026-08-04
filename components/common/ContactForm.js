"use client";
import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("gagal");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kamu"
        required
        className="w-full bg-white border border-cream-warm rounded-lg px-3 py-2 text-xs text-noir placeholder:text-warm-gray focus:outline-none focus:border-forest/60"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email kamu"
        required
        className="w-full bg-white border border-cream-warm rounded-lg px-3 py-2 text-xs text-noir placeholder:text-warm-gray focus:outline-none focus:border-forest/60"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Pesan kamu..."
        rows={3}
        required
        className="w-full bg-white border border-cream-warm rounded-lg px-3 py-2 text-xs text-noir placeholder:text-warm-gray focus:outline-none focus:border-forest/60 resize-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-forest text-white text-xs font-semibold py-2 rounded-lg hover:bg-forest-deep transition-all disabled:opacity-60"
      >
        {status === "sending" ? "Mengirim..." : "Kirim Pesan"}
      </button>
      {status === "sent" && (
        <p className="text-[11px] text-forest">
          Pesan terkirim. Terima kasih!
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-500">
          Gagal mengirim. Coba lagi nanti.
        </p>
      )}
    </form>
  );
}
