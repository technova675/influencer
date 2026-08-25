/**
 * Pure media helpers, safe in both server and client components.
 * Anything that touches R2 credentials lives in lib/r2.ts, which is server-only.
 */

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB

export const MAX_SHOWCASE_FILES = 6;

/** Public URL for a stored R2 key. */
export function publicMediaUrl(key: string | null | undefined) {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim().replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}

export function isVideoKey(key: string | null | undefined) {
  return !!key && /\.(mp4|mov|webm)$/i.test(key);
}

export function humanSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
