"use client";

import { usePathname } from "next/navigation";
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
 *
 * Keyed on the pathname. This component lives in the root layout, so it mounts
 * exactly once and would otherwise only ever observe the elements that existed
 * on the first page. After a client-side navigation the new page's `.reveal`
 * elements would be unobserved - and `html.js-reveal .reveal:not(.is-visible)`
 * pins those at opacity 0, so the whole page renders blank until a hard reload
 * remounts this. Re-running on every navigation is what keeps the new page
 * visible.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) {
      // Nothing to animate on this route - make sure a previous route has not
      // left the hiding rule switched on.
      root.classList.remove("js-reveal");
      return;
    }

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
  }, [pathname]);

  return null;
}
