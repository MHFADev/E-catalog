/**
 * Helper utilitas untuk memproses URL video dari berbagai platform
 * (YouTube, YouTube Shorts, TikTok, Instagram Reels, Vimeo, Direct MP4/WebM)
 * menjadi URL embed yang dioptimalkan dengan autoplay (muted) dan loop.
 */

export function parseVideoUrl(input) {
  if (!input) return null;
  let url = String(input).trim();
  if (!url) return null;

  // Jika input berupa tag <iframe>...</iframe>, ekstrak atribut src
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) {
    url = iframeMatch[1].trim();
  }

  // 1. YouTube (Standard, Shortlink, Shorts, Embed)
  // Format: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=1&rel=0&modestbranding=1`,
      originalUrl: url,
    };
  }

  // 2. TikTok
  // Format: tiktok.com/@user/video/1234567890 atau tiktok.com/v/1234567890
  const ttMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/i);
  if (ttMatch) {
    const videoId = ttMatch[1];
    return {
      type: "tiktok",
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      originalUrl: url,
    };
  }

  // 3. Instagram Reels & Post Video
  // Format: instagram.com/reel/CODE, instagram.com/p/CODE, instagram.com/tv/CODE
  const igMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch) {
    const code = igMatch[1];
    return {
      type: "instagram",
      videoId: code,
      embedUrl: `https://www.instagram.com/p/${code}/embed/`,
      originalUrl: url,
    };
  }

  // 4. Vimeo
  // Format: vimeo.com/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&playsinline=1`,
      originalUrl: url,
    };
  }

  // 5. Facebook Video
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return {
      type: "facebook",
      videoId: null,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&mute=1&show_text=false`,
      originalUrl: url,
    };
  }

  // 6. Direct Video File (.mp4, .webm, .ogg)
  const isDirect = /\.(mp4|webm|ogg)($|\?)/i.test(url);
  if (isDirect) {
    return {
      type: "direct",
      embedUrl: url,
      originalUrl: url,
    };
  }

  // Fallback: URL biasa
  return {
    type: "iframe",
    embedUrl: url,
    originalUrl: url,
  };
}
