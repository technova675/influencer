"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for anything carrying `.reveal`.
 *
 * Deliberately not CSS `animation-timeline: view()`. That approach leaves any
 * section sitting at the bottom of the document permanently at opacity 0,
 * because the page runs out of scroll before the element finishes its `entry`
 * range. An IntersectionObserver fires as soon as an element is *touching* the
 * viewport, which the last section always is once you reach the end.
 *
 * The hidden state is only ever applied after this mounts (via `js-reveal` on
 * <html>), so if the bundle fails to load the copy is simply visible.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    root.classList.add("js-reveal");

    // Anything already on screen at load reveals immediately - no flash.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    for (const el of els) observer.observe(el);

    // Safety net: whatever has not been revealed after 3s becomes visible
    // regardless, so a layout quirk can never strand content.
    const failsafe = window.setTimeout(() => {
      for (const el of els) el.classList.add("is-visible");
      observer.disconnect();
    }, 3000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
