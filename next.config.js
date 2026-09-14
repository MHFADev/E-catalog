/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan Next.js Image Optimization (WebP conversion, resize, caching)
  images: {
    remotePatterns: [
      {
        // Supabase Storage — project wqealargyqdxndcrtbla
        protocol: "https",
        hostname: "wqealargyqdxndcrtbla.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Storage — fallback URL langsung
        protocol: "https",
        hostname: "db.wqealargyqdxndcrtbla.supabase.co",
        pathname: "/**",
      },
    ],
    // Format modern: WebP diutamakan
    formats: ["image/webp"],
  },

  // Aktifkan gzip/brotli compression pada response
  compress: true,

  // Sembunyikan header X-Powered-By
  poweredByHeader: false,

  experimental: {
    // Upload publik dikirim sebagai base64 terkompresi dan dibatasi lebih ketat
    // di lib/github.js. Nilai ini memberi ruang aman untuk overhead Server Action.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Cache-control headers untuk media statis di folder public
  async headers() {
    return [
      {
        // Gambar, font, dan media di folder public
        source: "/:path*.(png|jpg|jpeg|webp|avif|svg|ico|woff|woff2|mp4|webm)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // Prevent Next.js from selecting an unrelated parent lockfile as the workspace root.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

module.exports = nextConfig;
