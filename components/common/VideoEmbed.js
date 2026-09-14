"use client";

import { parseVideoUrl } from "@/lib/videoEmbed";

export default function VideoEmbed({ url, title = "Video", className = "" }) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  if (parsed.type === "direct") {
    return (
      <div
        className={`aspect-video w-full rounded-2xl overflow-hidden bg-black relative shadow-sm border border-cream-warm ${className}`}
      >
        <video
          src={parsed.embedUrl}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="w-full h-full object-cover"
          aria-label={title}
        />
      </div>
    );
  }

  return (
    <div
      className={`aspect-video w-full rounded-2xl overflow-hidden bg-black/90 relative shadow-sm border border-cream-warm ${className}`}
    >
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="w-full h-full border-0 absolute inset-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
