"use client";
import Icon from "@/components/common/Icon";
import PaymentLogo from "@/components/common/PaymentLogo";

// Mapping tipe bank -> label
const bankLabels = {
  bca: "BCA",
  mandiri: "Mandiri",
  bri: "BRI",
  bni: "BNI",
  cimb: "CIMB Niaga",
  permata: "Permata",
  btn: "BTN",
  danamon: "Danamon",
};

const ewalletLabels = {
  dana: "DANA",
  ovo: "OVO",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  linkaja: "LinkAja",
};

export default function PaymentMethods({ seller }) {
  const methods = seller?.enabledPaymentMethods || [];
  if (!methods.length) return null;

  return (
    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-cream-warm">
      <h3 className="flex items-center gap-2 text-sm md:text-base font-bold text-noir mb-3 md:mb-4">
        <Icon name="money" size={18} className="text-forest" />
        Metode Pembayaran
      </h3>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {methods.includes("bank") && seller.bankName && (
          <div className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-cream-warm rounded-xl hover:border-forest/40 hover:shadow-md transition-all">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-noir truncate flex items-center gap-1.5">
                <PaymentLogo
                  methodName={seller.bankName}
                  methodType="bank"
                  imgClassName="h-5 w-auto object-contain shrink-0"
                  iconSize={16}
                />
                Transfer Bank {bankLabels[seller.bankName?.toLowerCase()] || seller.bankName}
              </p>
              {seller.bankAccountNumber && (
                <p className="text-[10px] text-warm-gray truncate font-mono">
                  {formatAccountNumber(seller.bankAccountNumber)}
                </p>
              )}
              {seller.bankAccountName && (
                <p className="text-[10px] text-warm-gray truncate">
                  a.n. {seller.bankAccountName}
                </p>
              )}
            </div>
          </div>
        )}

        {methods.includes("ewallet") && seller.ewalletType && (
          <div className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-cream-warm rounded-xl hover:border-forest/40 hover:shadow-md transition-all">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-noir truncate flex items-center gap-1.5">
                <PaymentLogo
                  methodName={seller.ewalletType}
                  methodType="ewallet"
                  imgClassName="h-5 w-auto object-contain shrink-0"
                  iconSize={16}
                />
                {ewalletLabels[seller.ewalletType] || seller.ewalletType}
              </p>
              {seller.ewalletNumber && (
                <p className="text-[10px] text-warm-gray truncate font-mono">
                  {formatPhoneNumber(seller.ewalletNumber)}
                </p>
              )}
            </div>
          </div>
        )}

        {methods.includes("qris") && seller.qrisImageUrl && (
          <div className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-cream-warm rounded-xl hover:border-forest/40 hover:shadow-md transition-all cursor-pointer">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-noir truncate flex items-center gap-1.5">
                <PaymentLogo methodName="qris" methodType="qris" imgClassName="h-5 w-auto object-contain shrink-0" iconSize={16} />
                QRIS
              </p>
              <p className="text-[10px] text-warm-gray">Scan untuk bayar</p>
            </div>
          </div>
        )}
      </div>

      {/* QRIS Modal Preview */}
      {methods.includes("qris") && seller.qrisImageUrl && (
        <QRISPreview qrisUrl={seller.qrisImageUrl} storeName={seller.name} />
      )}
    </div>
  );
}

function formatAccountNumber(num) {
  const cleaned = num.replace(/\D/g, "");
  return cleaned.replace(/(\d{4})/g, "$1 ").trim();
}

function formatPhoneNumber(num) {
  const cleaned = num.replace(/\D/g, "");
  if (cleaned.startsWith("62")) {
    return "+62 " + cleaned.slice(2).replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
}

// QRIS Preview Modal (simple CSS-only approach)
function QRISPreview({ qrisUrl, storeName }) {
  return (
    <div className="relative group">
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-cream-warm p-3">
          <p className="text-xs font-semibold text-noir text-center mb-2">QRIS {storeName}</p>
          <img
            src={qrisUrl}
            alt={`QRIS ${storeName}`}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <p className="text-[10px] text-warm-gray text-center mt-2">Scan untuk pembayaran</p>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-white" />
      </div>
    </div>
  );
}