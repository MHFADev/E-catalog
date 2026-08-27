"use client";

import Icon from "@/components/common/Icon";
import PaymentLogo from "@/components/common/PaymentLogo";

function formatReference(value, methodType) {
  if (!value) return null;
  const cleaned = String(value).replace(/\s/g, "");
  if (methodType === "bank") {
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  }
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

function methodTitle(method) {
  if (method.label) return method.label;
  if (method.methodType === "qris") return "QRIS";
  return method.provider || (method.methodType === "bank" ? "Transfer Bank" : "E-Wallet");
}

export default function PaymentMethods({ seller, methods = [] }) {
  if (!methods.length) return null;

  return (
    <section className="mt-4 border-t border-cream-warm pt-4 md:mt-6 md:pt-6">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-noir md:text-base">
          <Icon name="money" size={18} className="text-forest" />
          Metode Pembayaran
        </h3>
        <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest">
          {methods.length} tersedia
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {methods.map((method) => {
          const isQris = method.methodType === "qris";
          const reference = formatReference(method.accountNumber, method.methodType);

          return (
            <article
              key={method.id}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-cream-warm bg-white p-3 transition-all hover:border-forest/35 hover:shadow-sm"
            >
              <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-cream-warm bg-cream-pure px-1.5">
                <PaymentLogo
                  methodName={method.provider || method.label}
                  methodType={method.methodType}
                  imgClassName="max-h-6 w-auto max-w-full object-contain"
                  iconSize={18}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-noir">{methodTitle(method)}</p>
                {isQris ? (
                  <p className="mt-0.5 text-[10px] text-warm-gray">Scan QRIS untuk membayar</p>
                ) : (
                  <>
                    {reference && (
                      <p className="mt-0.5 truncate font-mono text-[10px] font-semibold text-noir-soft">
                        {reference}
                      </p>
                    )}
                    {method.accountName && (
                      <p className="truncate text-[10px] text-warm-gray">a.n. {method.accountName}</p>
                    )}
                  </>
                )}
              </div>

              {isQris && method.qrisImageUrl && (
                <a
                  href={method.qrisImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg border border-cream-warm bg-cream-pure p-1 transition-transform group-hover:scale-105"
                  aria-label={`Lihat QRIS ${seller?.name || "toko"}`}
                >
                  <img
                    src={method.qrisImageUrl}
                    alt={`QRIS ${seller?.name || "toko"}`}
                    className="h-9 w-9 rounded object-cover"
                  />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
