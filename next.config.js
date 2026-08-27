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
}

module.exports = nextConfig