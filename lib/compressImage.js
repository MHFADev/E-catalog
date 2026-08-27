// Kompres gambar di browser sebelum dikirim ke GitHub. Ukuran hasil sengaja
// dibatasi agar payload base64 tidak melampaui batas Server Action.
export const MAX_UPLOAD_DATA_URL_LENGTH = 900_000;
export const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function canvasToWebpDataUrl(canvas, quality) {
  return canvas.toDataURL("image/webp", quality);
}

export function compressImage(file, maxDim = 1280, quality = 0.72) {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Promise.reject(
      new Error("Format gambar tidak didukung. Gunakan file JPG, PNG, atau WebP."),
    );
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    return Promise.reject(
      new Error("Ukuran file terlalu besar. Gunakan gambar maksimal 10 MB."),
    );
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        if (!sourceWidth || !sourceHeight) {
          throw new Error("Ukuran gambar tidak dapat dibaca. Pilih file gambar lain.");
        }

        // Coba beberapa tingkat kompresi. Foto tetap tajam untuk katalog, namun
        // keluaran berhenti pada ukuran yang aman untuk transport ke server.
        const candidates = [
          { dimension: maxDim, quality },
          { dimension: Math.min(maxDim, 1120), quality: Math.min(quality, 0.68) },
          { dimension: Math.min(maxDim, 960), quality: Math.min(quality, 0.62) },
          { dimension: Math.min(maxDim, 800), quality: Math.min(quality, 0.56) },
        ];

        for (const candidate of candidates) {
          const scale = Math.min(1, candidate.dimension / Math.max(sourceWidth, sourceHeight));
          const width = Math.max(1, Math.round(sourceWidth * scale));
          const height = Math.max(1, Math.round(sourceHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Browser tidak dapat memproses gambar ini.");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvasToWebpDataUrl(canvas, candidate.quality);
          if (dataUrl.length <= MAX_UPLOAD_DATA_URL_LENGTH) {
            resolve(dataUrl);
            return;
          }
        }

        reject(
          new Error(
            "Gambar masih terlalu besar setelah dikompres. Gunakan foto maksimal 10 MB atau perkecil ukurannya lalu coba lagi.",
          ),
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File gambar tidak dapat dibaca. Gunakan JPG, PNG, atau WebP yang valid."));
    };

    img.src = url;
  });
}
