"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import {
  approveSellerAccount,
  rejectSellerAccount,
  setSellerAccountBlocked,
  deleteSellerAccount,
} from "@/app/admin/(panel)/actions";

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
  blocked: "bg-red-100 text-red-700",
};

const statusLabel = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  blocked: "Diblokir",
};

function buildActions(a) {
  const list = [];
  if (a.status === "pending" || a.status === "rejected") {
    list.push({
      key: "approve",
      label: "Setujui",
      tone: "green",
      icon: "check",
      form: { userId: a.user_id },
      fn: approveSellerAccount,
      title: "Setujui akun ini?",
      desc: `Akun "${a.business_name}" akan disetujui sebagai penjual. ${a.sellers ? `Toko yang terhubung: ${a.sellers.name}` : "Toko akan dibuat otomatis dari data usaha ini."}`,
    });
  }
  if (a.status === "approved") {
    list.push({
      key: "reject",
      label: "Tolak",
      tone: "red",
      icon: "close",
      form: { userId: a.user_id },
      fn: rejectSellerAccount,
      title: "Tolak akun ini?",
      desc: `Akun "${a.business_name}" akan ditandai sebagai ditolak.`,
    });
  }
  if (a.status === "blocked") {
    list.push({
      key: "unblock",
      label: "Buka Blokir",
      tone: "green",
      icon: "badgeCheck",
      form: { userId: a.user_id, blocked: "false" },
      fn: setSellerAccountBlocked,
      title: "Buka blokir akun ini?",
      desc: `Akun "${a.business_name}" akan kembali bisa mengelola toko.`,
    });
  } else {
    list.push({
      key: "block",
      label: "Blokir",
      tone: "yellow",
      icon: "ban",
      form: { userId: a.user_id, blocked: "true" },
      fn: setSellerAccountBlocked,
      title: "Blokir akun ini?",
      desc: `Akun "${a.business_name}" akan diblokir dan situs menampilkan banner kuning pada tokonya. Blokir bisa dibuka kembali.`,
    });
  }
  list.push({
    key: "delete",
    label: "Hapus Akun",
    tone: "red",
    icon: "trashFilled",
    form: { userId: a.user_id },
    fn: deleteSellerAccount,
    title: "Hapus seluruh data UMKM?",
    desc: `Seluruh data akun "${a.business_name}" akan dihapus permanen dari database: akun penjual, toko, dan semua produknya. Tindakan ini tidak bisa dibatalkan.`,
    danger: true,
  });
  return list;
}

function ConfirmDialog({ action, account, busy, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-7">
        <div className="flex items-start gap-3 mb-3">
          <span
            className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 ${
              action.tone === "red"
                ? "bg-red-100 text-red-600"
                : action.tone === "yellow"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
            }`}
          >
            <Icon name={action.icon} size={20} />
          </span>
          <div>
            <h3 className="text-sm md:text-base font-bold text-noir leading-snug">
              {action.title}
            </h3>
            <p className="text-xs text-warm-gray leading-relaxed mt-1">
              {action.desc}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-cream-pure border border-cream-warm px-3 py-2 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-warm-gray">
            ID Akun
          </div>
          <div className="font-mono text-xs text-noir-soft break-all">
            {account.user_id}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60"
          >
            <Icon name="close" size={13} /> No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Icon name="check" size={13} /> Yes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsManager({ accounts }) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // State untuk kata kunci pencarian akun — filter by nama usaha, toko, atau ID
  const [search, setSearch] = useState("");

  // Filter akun berdasarkan query pencarian (case-insensitive)
  const searchLower = search.toLowerCase().trim();
  const filtered = searchLower
    ? accounts?.filter(
        (a) =>
          (a.business_name || "").toLowerCase().includes(searchLower) ||
          (a.sellers?.name || "").toLowerCase().includes(searchLower) ||
          (a.user_id || "").toLowerCase().includes(searchLower) ||
          (a.whatsapp || "").includes(searchLower)
      )
    : accounts;

  const run = async (action, account) => {
    setBusy(true);
    setError("");
    const fd = new FormData();
    Object.entries(action.form).forEach(([k, v]) => fd.set(k, v));
    try {
      await action.fn(fd);
      setPending(null);
      router.refresh();
    } catch (ex) {
      setError(ex.message || "Gagal menjalankan aksi.");
    }
    setBusy(false);
  };

  return (
    <div>
      {/* Input pencarian akun — filter langsung di client tanpa reload */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Cari nama usaha, toko, WhatsApp, atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-warm bg-white text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filtered?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            {search ? `Tidak ada akun yang cocok dengan "${search}".` : "Belum ada akun penjual terdaftar."}
          </p>
        )}

        {filtered?.map((a) => (
          <div
            key={a.user_id}
            className="bg-white rounded-2xl p-4 border border-cream-warm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="text-sm font-semibold text-noir">
                {a.business_name}
              </span>
              {a.whatsapp && (
                <a
                  href={`https://wa.me/${a.whatsapp.replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest hover:underline"
                >
                  {a.whatsapp}
                </a>
              )}
              <span className="text-[10px] md:text-xs text-warm-gray">
                {new Date(a.created_at).toLocaleString("id-ID")}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge[a.status]}`}
              >
                {statusLabel[a.status]}
              </span>
            </div>

            <div className="text-[11px] md:text-xs text-warm-gray mb-2 space-y-0.5">
              <div>
                ID Akun:{" "}
                <span className="font-mono font-semibold text-noir-soft">
                  {a.user_id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 mb-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center text-warm-gray shrink-0">
                {a.sellers?.logo ? (
                  <img
                    src={a.sellers.logo}
                    alt={a.sellers.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="store" size={18} />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-warm-gray">
                  Toko terhubung
                </div>
                <div className="text-xs md:text-sm font-semibold text-noir truncate">
                  {a.sellers?.name ?? (
                    <span className="text-amber-600">
                      Belum ada — dibuat otomatis saat disetujui
                    </span>
                  )}
                </div>
                {(a.sellers?.whatsapp || a.sellers?.address) && (
                  <div className="text-[11px] text-warm-gray truncate">
                    {a.sellers.whatsapp}
                    {a.sellers.whatsapp && a.sellers.address && " • "}
                    {a.sellers.address}
                  </div>
                )}
              </div>
            </div>

            {a.status === "approved" && (
              <div className="text-xs text-emerald-700 mb-2">
                Akun aktif — pemilik dapat mengelola produk toko ini.
              </div>
            )}
            {a.status === "blocked" && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                Akun diblokir — pemilik tidak dapat mengakses area penjual.
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-cream-warm">
              {buildActions(a).map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    setError("");
                    setPending({ action, account: a });
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    action.tone === "green"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : action.tone === "yellow"
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Icon name={action.icon} size={13} /> {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {pending && (
        <ConfirmDialog
          action={pending.action}
          account={pending.account}
          busy={busy}
          onConfirm={() => run(pending.action, pending.account)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}