import { z } from "zod";
import { AGE_BANDS, CONTENT_FORMATS, GENRES, LANGUAGES } from "./taxonomy";

/** "" -> undefined, so empty form fields become NULL rather than "". */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = z.preprocess(
  blankToUndefined,
  z.string().trim().max(300).optional(),
);

const optionalUrl = z.preprocess(
  blankToUndefined,
  z.string().trim().url("Enter a full URL including https://").max(500).optional(),
);

/** Strips @, full URLs and trailing slashes down to a bare handle. */
const handle = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  const cleaned = v
    .trim()
    .replace(/^https?:\/\/(www\.)?[^/]+\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  return cleaned === "" ? undefined : cleaned;
}, z.string().max(100).optional());

/** Accepts "45,300" and "45300 " alike. */
const count = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    const n = Number(v.replace(/[,\s]/g, ""));
    return Number.isNaN(n) ? v : n;
  }
  return v;
}, z.number().int().min(0).max(1_000_000_000).optional());

const percent = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    const n = Number(v.replace(/[%\s]/g, ""));
    return Number.isNaN(n) ? v : n;
  }
  return v;
}, z.number().min(0).max(100).optional());

/** Comma-separated free text -> string[] */
const csvList = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string" || v.trim() === "") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);
}, z.array(z.string().max(120)).max(25));

export const creatorSubmissionSchema = z
  .object({
    full_name: z.string().trim().min(2, "Tell us your name").max(120),
    display_name: optionalText,
    email: z.string().trim().toLowerCase().email("That email looks off"),
    phone: z.preprocess(
      blankToUndefined,
      z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{7,17}$/, "Enter a valid phone number")
        .optional(),
    ),
    whatsapp: optionalText,
    bio: z.preprocess(blankToUndefined, z.string().trim().max(800).optional()),

    city: optionalText,
    state: optionalText,
    country: z.string().trim().default("India"),
    languages: z.array(z.enum(LANGUAGES)).max(13).default([]),

    primary_genre: z.enum(GENRES, { message: "Pick your main genre" }),
    secondary_genres: z.array(z.enum(GENRES)).max(5).default([]),
    content_formats: z.array(z.enum(CONTENT_FORMATS)).max(8).default([]),

    instagram_handle: handle,
    youtube_handle: handle,
    tiktok_handle: handle,
    x_handle: handle,
    linkedin_url: optionalUrl,
    portfolio_url: optionalUrl,

    instagram_followers: count,
    youtube_subscribers: count,
    tiktok_followers: count,
    x_followers: count,
    avg_reel_views: count,
    engagement_rate: percent,

    audience_female_pct: percent,
    audience_age_band: z.preprocess(
      blankToUndefined,
      z.enum(AGE_BANDS).optional(),
    ),
    audience_top_cities: csvList,

    rate_reel: count,
    rate_story: count,
    rate_static_post: count,
    rate_youtube_integration: count,
    rate_ugc_video: count,
    barter_open: z.coerce.boolean().default(false),

    past_brands: csvList,
    notable_work_urls: csvList,

    /* R2 object keys produced by the browser upload, not file bytes. */
    profile_photo_path: optionalText,
    showcase_media_paths: z
      .preprocess(
        (v) => (Array.isArray(v) ? v : v ? [v] : []),
        z.array(z.string().max(200)).max(6),
      )
      .default([]),

    /** Honeypot. Bots fill it, humans never see it. */
    website: z.string().max(0, "Rejected").optional(),
  })
  .refine(
    (d) =>
      Boolean(
        d.instagram_handle ||
          d.youtube_handle ||
          d.tiktok_handle ||
          d.x_handle,
      ),
    {
      message: "Add at least one social handle so we can find your work",
      path: ["instagram_handle"],
    },
  )
  .refine(
    (d) =>
      (d.instagram_followers ?? 0) +
        (d.youtube_subscribers ?? 0) +
        (d.tiktok_followers ?? 0) +
        (d.x_followers ?? 0) >
      0,
    {
      message: "Enter your follower count on at least one platform",
      path: ["instagram_followers"],
    },
  );

export type CreatorSubmission = z.infer<typeof creatorSubmissionSchema>;

/** FormData -> plain object, collecting repeated keys into arrays. */
export function formDataToObject(fd: FormData) {
  const multi = new Set([
    "languages",
    "secondary_genres",
    "content_formats",
    "showcase_media_paths",
  ]);
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).filter((v) => v !== "");
    out[key] = multi.has(key) ? all : (all[all.length - 1] ?? "");
  }
  for (const key of multi) if (!(key in out)) out[key] = [];
  return out;
}
