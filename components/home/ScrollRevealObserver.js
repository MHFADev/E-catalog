"use client";

import { useEffect } from "react";

const SELECTOR = ".scroll-reveal";

export default function ScrollRevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const elements = Array.from(document.querySelectorAll(SELECTOR));
    if (!elements.length) return undefined;

    const reveal = (element) => {
      element.classList.add("scroll-reveal--visible");
      element.classList.remove("scroll-reveal--ready");
    };

    if (!("IntersectionObserver" in window)) {
      elements.forEach(reveal);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const frame = window.requestAnimationFrame(() => {
      elements.forEach((element) => {
        const isAlreadyVisible = element.getBoundingClientRect().top < window.innerHeight * 0.9;
        if (isAlreadyVisible) reveal(element);
        else {
          element.classList.add("scroll-reveal--ready");
          observer.observe(element);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("scroll-reveal--ready"));
    };
  }, []);

  return null;
}
