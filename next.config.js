/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    // Upload publik dikirim sebagai base64 terkompresi dan dibatasi lebih ketat
    // di lib/github.js. Nilai ini memberi ruang aman untuk overhead Server Action.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Prevent Next.js from selecting an unrelated parent lockfile as the workspace root.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
}

module.exports = nextConfig
