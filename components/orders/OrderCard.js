"use client";

import { useState } from "react";
import Icon from "@/components/common/Icon";
import ActionConfirmDialog from "@/components/common/ActionConfirmDialog";
import {
  processOrder,
  rejectOrder,
  completeOrder,
} from "@/app/seller/(panel)/orders/actions";

export const ORDER_STATUS = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi WA",
    cls: "bg-sky-100 text-sky-800 border border-sky-200",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    cls: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  diproses: {
    label: "Diproses",
    cls: "bg-violet-100 text-violet-800 border border-violet-200",
  },
  selesai: {
    label: "Selesai",
    cls: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  ditolak: {
    label: "Ditolak",
    cls: "bg-red-100 text-red-800 border border-red-200",
  },
  dibatalkan: {
    label: "Dibatalkan",
    cls: "bg-gray-100 text-gray-700 border border-gray-200",
  },
};

const WARNING_TEXT =
  "Jangan langsung memproses pesanan. Cek mutasi rekening atau aplikasi e-wallet Anda untuk memastikan dana benar-benar sudah masuk. Waspadai bukti transfer palsu atau hasil edit.";

function fmtDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value) {
  return value != null ? `Rp${Number(value).toLocaleString("id-ID")}` : "Konfirmasi harga";
}

export default function OrderCard({ order }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.dibatalkan;
  const isManualVerification = order.status === "menunggu_verifikasi";
  const isWhatsAppConfirmation = order.status === "menunggu_konfirmasi";
  const isProcessing = order.status === "diproses";
  const isWhatsApp = order.order_channel === "whatsapp";
  const payment = order.payment_methods;
  const product = order.products;

  async function runAction(action) {
    const handlers = {
      process: processOrder,
      reject: rejectOrder,
      complete: completeOrder,
    };
    const formData = new FormData();
    formData.set("id", order.id);
    if (action === "reject" && rejectionReason.trim()) {
      formData.set("reason", rejectionReason.trim());
    }

    setBusy(action);
    setError("");
    try {
      await handlers[action](formData);
      setRejectOpen(false);
    } catch (exception) {
      setError(exception.message || "Tindakan belum dapat diproses.");
    } finally {
      setBusy("");
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-cream-warm bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-warm bg-cream-pure/60 px-4 py-3 md:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-noir md:text-sm">{order.order_number}</span>
          <span className="text-[10px] text-warm-gray md:text-xs">{fmtDate(order.created_at)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold md:text-xs ${status.cls}`}>
            {status.label}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold md:text-xs ${isWhatsApp ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>
            <Icon name={isWhatsApp ? "whatsapp" : "money"} size={11} />
            {isWhatsApp ? "WhatsApp" : "Transfer"}
          </span>
        </div>
      </header>

      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:gap-6 md:p-5">
        <div className="min-w-0 space-y-3 text-xs md:text-sm">
          <div className="flex items-start gap-3">
            {product?.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product?.name || "Produk"}
                className="h-12 w-12 shrink-0 rounded-xl border border-cream-warm object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-pure text-forest">
                <Icon name="package" size={18} />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-noir">{product?.name || "Produk"}</p>
              <p className="text-warm-gray">{order.quantity} item · {formatMoney(order.total)}</p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-cream-warm pt-3 sm:grid-cols-2">
            <div className="min-w-0 text-warm-gray leading-relaxed">
              <p className="text-[10px] font-bold uppercase tracking-wide text-warm-gray">Data pemesan</p>
              <p className="mt-0.5 font-semibold text-noir">{order.buyer_name}</p>
              {order.buyer_phone && <p>WhatsApp: +{order.buyer_phone}</p>}
              {order.buyer_country && <p>Negara: {order.buyer_country}</p>}
            </div>
            <div className="min-w-0 text-warm-gray leading-relaxed">
              <p className="text-[10px] font-bold uppercase tracking-wide text-warm-gray">Pengiriman & catatan</p>
              <p className="mt-0.5">{order.buyer_address || "Alamat belum diisi"}</p>
              {order.notes && <p className="mt-1 italic">“{order.notes}”</p>}
            </div>
          </div>

          {payment && (
            <p className="rounded-xl border border-cream-warm bg-cream-pure px-3 py-2 text-warm-gray">
              <span className="font-semibold text-noir">Metode transfer:</span> {payment.label || payment.method_type}
              {payment.account_number ? ` (${payment.account_number})` : ""}
            </p>
          )}

          {order.status === "ditolak" && order.rejection_reason && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
              <span className="font-semibold">Alasan penolakan:</span> {order.rejection_reason}
            </p>
          )}
        </div>

        {isManualVerification && (
          <aside className="space-y-3 md:w-80">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-noir">
                <Icon name="image" size={14} className="text-forest" /> Bukti transfer pembeli
              </p>
              {order.receipt_path ? (
                <img
                  src={`/api/orders/${order.id}/receipt`}
                  alt="Bukti transfer pembeli"
                  className="aspect-[3/4] w-full max-w-[280px] rounded-xl border border-cream-warm bg-cream-warm object-contain"
                />
              ) : (
                <p className="rounded-xl bg-cream-warm px-3 py-4 text-center text-[11px] text-warm-gray">Tidak ada bukti transfer diunggah.</p>
              )}
            </div>
            <div className="rounded-xl bg-red-600 p-3 text-[11px] font-semibold leading-relaxed text-white shadow-lg ring-2 ring-red-600 ring-offset-2">
              {WARNING_TEXT}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                disabled={busy === "process"}
                onClick={() => runAction("process")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy === "process" ? "Memproses..." : <><Icon name="check" size={16} /> Verifikasi & Proses</>}
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-red-700"
              >
                <Icon name="ban" size={16} /> Tolak pesanan
              </button>
            </div>
          </aside>
        )}

        {isWhatsAppConfirmation && (
          <aside className="space-y-3 md:w-80">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs leading-relaxed text-sky-900">
              <p className="flex items-center gap-1.5 font-bold"><Icon name="whatsapp" size={14} /> Pesanan dari WhatsApp</p>
              <p className="mt-1 text-sky-800">Konfirmasi ketersediaan, ongkir, dan cara pembayaran melalui percakapan dengan pembeli sebelum mulai memproses pesanan.</p>
            </div>
            {order.buyer_phone && (
              <a
                href={`https://wa.me/${order.buyer_phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa w-full py-3 text-sm"
              >
                <Icon name="whatsapp" size={16} /> Hubungi pembeli
              </a>
            )}
            <button
              type="button"
              disabled={busy === "process"}
              onClick={() => runAction("process")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy === "process" ? "Memproses..." : <><Icon name="check" size={16} /> Konfirmasi & Proses</>}
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-red-700"
            >
              <Icon name="ban" size={16} /> Tolak pesanan
            </button>
          </aside>
        )}

        {isProcessing && (
          <aside className="flex flex-col justify-center md:w-56">
            <button
              type="button"
              disabled={busy === "complete"}
              onClick={() => runAction("complete")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-60"
            >
              {busy === "complete" ? "Menyimpan..." : <><Icon name="check" size={16} /> Tandai selesai</>}
            </button>
          </aside>
        )}
      </div>

      {error && <p className="px-4 pb-3 text-xs text-red-700" role="alert">{error}</p>}

      <ActionConfirmDialog
        open={rejectOpen}
        title="Tolak pesanan ini?"
        description="Pesanan akan ditandai sebagai ditolak. Pembeli akan melihat status ini pada riwayat pesanan mereka."
        confirmLabel="Ya, tolak pesanan"
        icon="ban"
        tone="danger"
        busy={busy === "reject"}
        onCancel={() => !busy && setRejectOpen(false)}
        onConfirm={() => runAction("reject")}
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-noir">Alasan penolakan <span className="font-normal text-warm-gray">(opsional)</span></span>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value.slice(0, 500))}
            rows={3}
            placeholder="Contoh: stok habis atau alamat belum dapat dijangkau"
            className="w-full resize-y rounded-xl border border-cream-warm bg-cream-pure px-3 py-2 text-xs text-noir placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
      </ActionConfirmDialog>
    </article>
  );
}
