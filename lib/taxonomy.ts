/**
 * Shared vocabulary. The form, the filters and the seed data all read from
 * here so a genre can never exist in one place and not the other.
 */

export const GENRES = [
  "Entertainment",
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Food",
  "Travel",
  "Fitness",
  "Finance",
  "Tech",
  "Gaming",
  "Infotainment",
  "Education",
  "Comedy",
  "Music",
  "Dance",
  "Parenting",
  "Automobile",
  "Celebrity",
] as const;

/**
 * What a person on the roster actually sells. This is the one distinction the
 * whole site turns on:
 *
 *   influencer  - sells access to their audience. Priced per placement on
 *                 their own channel. Reach and engagement are the product.
 *   ugc_creator - sells the footage. The brand runs it as an ad on the brand's
 *                 own channels. An audience is not required, which is why a
 *                 follower tier is never shown for one.
 *   both        - does either, priced separately.
 */
export const TALENT_TYPES = [
  {
    id: "influencer",
    label: "Influencer",
    short: "Posts on my channel",
    blurb:
      "Brands pay you to post to your own audience. Your reach, engagement and rate card are what they shortlist on.",
  },
  {
    id: "ugc_creator",
    label: "UGC creator",
    short: "I shoot, the brand posts",
    blurb:
      "You film the content and hand it over — the brand runs it as an ad. No audience needed. Your craft, formats and turnaround are what they shortlist on.",
  },
  {
    id: "both",
    label: "Both",
    short: "I do both",
    blurb:
      "You post to your own audience and take content-only briefs. You'll show up in both sets of results, with separate rates for each.",
  },
] as const;

export type TalentType = (typeof TALENT_TYPES)[number]["id"];

export const TALENT_TYPE_IDS = TALENT_TYPES.map((t) => t.id) as [
  TalentType,
  ...TalentType[],
];

export function talentType(id: string | null | undefined) {
  return TALENT_TYPES.find((t) => t.id === id) ?? TALENT_TYPES[0];
}

/**
 * Whether follower count, engagement and tier mean anything for this person.
 * A pure UGC creator may have no audience at all, and `creator_tier()` buckets
 * a null follower count into "Nano" - so showing either would be actively
 * misleading rather than merely empty.
 */
export function sellsReach(type: TalentType | null | undefined) {
  return type !== "ugc_creator";
}

/** Whether they take content-only briefs - drives the UGC side of a card. */
export function sellsContent(type: TalentType | null | undefined) {
  return type === "ugc_creator" || type === "both";
}

export const CONTENT_FORMATS = [
  "Instagram Reels",
  "Instagram Stories",
  "Static Posts",
  "YouTube Long-form",
  "YouTube Shorts",
  "UGC / Ad Creative",
  "Livestreams",
  "Podcasts",
] as const;

export const LANGUAGES = [
  "Hindi",
  "English",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Assamese",
  "Urdu",
] as const;

export const CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Indore",
  "Kochi",
  "Surat",
  "Other",
] as const;

export const AGE_BANDS = ["13-17", "18-24", "25-34", "35-44", "45+"] as const;

export type Tier = "nano" | "micro" | "mid" | "macro" | "mega";

export const TIERS: {
  id: Tier;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "nano", label: "Nano", min: 0, max: 9_999 },
  { id: "micro", label: "Micro", min: 10_000, max: 99_999 },
  { id: "mid", label: "Mid", min: 100_000, max: 499_999 },
  { id: "macro", label: "Macro", min: 500_000, max: 999_999 },
  { id: "mega", label: "Mega", min: 1_000_000, max: null },
];

export function tierFor(followers: number | null | undefined): Tier {
  const n = followers ?? 0;
  if (n < 10_000) return "nano";
  if (n < 100_000) return "micro";
  if (n < 500_000) return "mid";
  if (n < 1_000_000) return "macro";
  return "mega";
}

export function tierLabel(followers: number | null | undefined) {
  const id = tierFor(followers);
  return TIERS.find((t) => t.id === id)!.label;
}

/** 1234567 -> "1.2M", 45300 -> "45.3K" */
export function compactNumber(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatRupees(n: number | null | undefined) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const STATUSES = [
  "pending",
  "approved",
  "featured",
  "rejected",
  "archived",
] as const;

export type Status = (typeof STATUSES)[number];
