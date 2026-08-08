"use client";

// Global error boundary: menangkap error bahkan saat root layout gagal.
// WAJIB menyediakan <html> & <body> karena dipakai di luar tree layout.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#FBFAF5" }}>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 20px",
                borderRadius: "9999px",
                background: "rgba(30,122,61,.1)",
                color: "#1E7A3D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#231F1F",
                margin: "0 0 8px",
              }}
            >
              Terjadi Kesalahan
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#7C766A",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Maaf, situs sedang bermasalah. Coba lagi sebentar.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#1E7A3D",
                color: "#fff",
                border: 0,
                borderRadius: "9999px",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}