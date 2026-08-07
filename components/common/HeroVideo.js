"use client";

export default function HeroVideo({ src = "/hero-video.mp4", poster = "/hero-poster.webp", className = "" }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Liquid glass overlay - semi-transparent with backdrop blur */}
      <div className="absolute inset-0 bg-[rgba(18,40,75,0.45)] backdrop-blur-[2px] backdrop-saturate-[120%]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,40,75,0.6)] via-[rgba(18,40,75,0.35)] to-[rgba(18,40,75,0.55)]" aria-hidden="true" />
    </div>
  );
}