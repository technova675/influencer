import { z } from "zod";
import {
  AGE_BANDS,
  CONTENT_FORMATS,
  EXPERIENCE_LEVEL_IDS,
  GENRES,
  LANGUAGES,
  MODEL_CATEGORIES,
  TALENT_TYPE_IDS,
  isModel,
  sellsReach,
} from "./taxonomy";

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

/** A measurement in whole centimetres, within a plausible human range. */
const measurement = (min: number, max: number) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const n = Number(v.replace(/[^\d.]/g, ""));
      return Number.isNaN(n) ? v : Math.round(n);
    }
    return v;
  }, z.number().int().min(min).max(max).optional());

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
    /* Sent as one value - the form joins the picked dialling code and the
       number before posting - so it is validated as one. */
    phone: z.preprocess(
      blankToUndefined,
      z
        .string({ message: "Add a phone number we can reach you on" })
        .trim()
        .regex(/^[+\d][\d\s-]{7,17}$/, "Enter a valid phone number"),
    ),
    whatsapp: optionalText,
    bio: z.preprocess(blankToUndefined, z.string().trim().max(800).optional()),

    city: optionalText,
    country: z.string().trim().default("India"),
    languages: z.array(z.enum(LANGUAGES)).max(13).default([]),

    /* The first question on the form: it decides which of the fields below
       are even asked for, and how the roster card renders. */
    talent_type: z.enum(TALENT_TYPE_IDS, {
      message: "Pick how you work with brands",
    }),

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
    rate_video: count,
    turnaround_days: z.preprocess((v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    }, z.number().int().min(1).max(60).optional()),
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

    /* ----- model only -----------------------------------------------------
       Written to `model_profiles`, not to `creators`. Every one of these is
       optional at the field level; the two a model actually has to give are
       enforced by the refine below, so a creator or an influencer is never
       asked for a measurement. */
    height_cm: measurement(120, 220),
    bust_cm: measurement(40, 200),
    waist_cm: measurement(40, 200),
    hips_cm: measurement(40, 200),
    dress_size: z.preprocess(blankToUndefined, z.string().trim().max(20).optional()),
    shoe_size: z.preprocess(blankToUndefined, z.string().trim().max(20).optional()),
    hair_colour: z.preprocess(blankToUndefined, z.string().trim().max(40).optional()),
    eye_colour: z.preprocess(blankToUndefined, z.string().trim().max(40).optional()),
    visible_tattoos: z.coerce.boolean().default(false),
    model_categories: z.array(z.enum(MODEL_CATEGORIES)).max(12).default([]),
    experience_level: z.preprocess(
      blankToUndefined,
      z.enum(EXPERIENCE_LEVEL_IDS).optional(),
    ),
    agency_signed: z.coerce.boolean().default(false),
    agency_name: z.preprocess(blankToUndefined, z.string().trim().max(160).optional()),
    rate_half_day: count,
    rate_full_day: count,
    travel_willing: z.coerce.boolean().default(false),
    buyout_terms: z.preprocess(
      blankToUndefined,
      z.string().trim().max(600).optional(),
    ),

    /** Honeypot. Bots fill it, humans never see it. */
    website: z.string().max(0, "Rejected").optional(),
  })
  /* We have to be able to find the work. For an influencer that means a
     handle; a creator may have no audience at all, so a portfolio link or
     an uploaded sample counts just as well. */
  .refine(
    (d) => {
      const hasHandle = Boolean(
        d.instagram_handle ||
          d.youtube_handle ||
          d.tiktok_handle ||
          d.x_handle,
      );
      if (hasHandle) return true;
      if (sellsReach(d.talent_type)) return false;
      return Boolean(
        d.portfolio_url || (d.showcase_media_paths ?? []).length > 0,
      );
    },
    {
      message: "Add a handle, a portfolio link or a sample so we can see your work",
      path: ["instagram_handle"],
    },
  )
  /* Follower counts are only meaningful for someone selling reach. Asking a
     creator for one - and rejecting them without it - is the exact
     confusion this field exists to remove. */
  .refine(
    (d) =>
      !sellsReach(d.talent_type) ||
      (d.instagram_followers ?? 0) +
        (d.youtube_subscribers ?? 0) +
        (d.tiktok_followers ?? 0) +
        (d.x_followers ?? 0) >
        0,
    {
      message: "Enter your follower count on at least one platform",
      path: ["instagram_followers"],
    },
  )
  /* Height is the one field every casting brief filters on, so a model row
     without it is unbookable. Nobody else is ever asked for it. */
  .refine((d) => !isModel(d.talent_type) || d.height_cm != null, {
    message: "Height is what casting filters on — give it in centimetres",
    path: ["height_cm"],
  })
  /* And what they are cast for, which is the model's answer to a genre. */
  .refine((d) => !isModel(d.talent_type) || d.model_categories.length > 0, {
    message: "Pick at least one thing you get cast for",
    path: ["model_categories"],
  });

/** The submission fields that belong to `model_profiles`, not to `creators`. */
export const MODEL_PROFILE_FIELDS = [
  "height_cm",
  "bust_cm",
  "waist_cm",
  "hips_cm",
  "dress_size",
  "shoe_size",
  "hair_colour",
  "eye_colour",
  "visible_tattoos",
  "model_categories",
  "experience_level",
  "agency_signed",
  "agency_name",
  "rate_half_day",
  "rate_full_day",
  "travel_willing",
  "buyout_terms",
] as const;

export type CreatorSubmission = z.infer<typeof creatorSubmissionSchema>;

/** FormData -> plain object, collecting repeated keys into arrays. */
export function formDataToObject(fd: FormData) {
  const multi = new Set([
    "languages",
    "secondary_genres",
    "content_formats",
    "showcase_media_paths",
    "model_categories",
  ]);
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).filter((v) => v !== "");
    out[key] = multi.has(key) ? all : (all[all.length - 1] ?? "");
  }
  for (const key of multi) if (!(key in out)) out[key] = [];
  return out;
}
