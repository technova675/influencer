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
 *   creator - sells the footage. The brand runs it as an ad on the brand's
 *                 own channels. An audience is not required, which is why a
 *                 follower tier is never shown for one.
 *   both        - does either, priced separately.
 *   model       - sells a booked day. Neither an audience nor a rate card per
 *                 post applies; casting attributes, digitals and a day rate
 *                 are the product, and they live in `model_profiles`.
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
    id: "creator",
    label: "Creator",
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
  {
    id: "model",
    label: "Model",
    short: "I get booked for shoots",
    blurb:
      "You're cast for shoots and campaigns and paid for the day, not the post. Your digitals, measurements and day rate are what get you booked — no follower count needed.",
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
 * A pure creator may have no audience at all, and `creator_tier()` buckets
 * a null follower count into "Nano" - so showing either would be actively
 * misleading rather than merely empty.
 */
export function sellsReach(type: TalentType | null | undefined) {
  return type === "influencer" || type === "both";
}

/** Whether they take content-only briefs - drives the content side of a card. */
export function sellsContent(type: TalentType | null | undefined) {
  return type === "creator" || type === "both";
}

/**
 * A model is booked for a day, not for a post. Nothing on the reach side of
 * the card or the form applies to one, and everything that does lives in the
 * `model_profiles` row hanging off the creator.
 */
export function isModel(type: TalentType | null | undefined) {
  return type === "model";
}

/**
 * Whether uploaded media is the headline of this person's card. A creator
 * sells the footage and a model sells the digitals - for both, the pictures do
 * the job a follower count does for an influencer.
 */
export function showsWork(type: TalentType | null | undefined) {
  return sellsContent(type) || isModel(type);
}

/* ------------------------------------------------------- model vocabulary */

/** What a model is cast for. The model equivalent of a genre. */
export const MODEL_CATEGORIES = [
  "Runway",
  "Editorial",
  "Commercial / Print",
  "E-commerce / Catalogue",
  "Beauty",
  "Hair",
  "Bridal",
  "Fitness",
  "Plus-size",
  "Parts / Hand",
  "Promotional / Events",
  "Acting",
] as const;

export const EXPERIENCE_LEVELS = [
  { id: "new_face", label: "New face" },
  { id: "intermediate", label: "Some shoots" },
  { id: "experienced", label: "Experienced" },
  { id: "professional", label: "Full-time professional" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["id"];

export const EXPERIENCE_LEVEL_IDS = EXPERIENCE_LEVELS.map((e) => e.id) as [
  ExperienceLevel,
  ...ExperienceLevel[],
];

export function experienceLabel(id: string | null | undefined) {
  return EXPERIENCE_LEVELS.find((e) => e.id === id)?.label ?? null;
}

/** 173 -> "173cm / 5'8\"" - agencies read both, so show both. */
export function formatHeight(cm: number | null | undefined) {
  if (cm === null || cm === undefined) return null;
  const inches = Math.round(cm / 2.54);
  return `${cm}cm / ${Math.floor(inches / 12)}'${inches % 12}"`;
}

export const CONTENT_FORMATS = [
  "Instagram Reels",
  "Instagram Stories",
  "Static Posts",
  "YouTube Long-form",
  "YouTube Shorts",
  "Ad Creative",
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

/**
 * A rate as a band rather than a figure, for anywhere a card is shown to
 * someone who has not signed in. What a creator charges is the roster's most
 * commercially sensitive column, and a band is enough to tell a brand whether
 * they are in the right neighbourhood.
 */
export function rateBand(n: number | null | undefined) {
  if (n === null || n === undefined) return null;
  if (n < 10_000) return "under ₹10K";
  if (n < 25_000) return "₹10K–25K";
  if (n < 50_000) return "₹25K–50K";
  if (n < 100_000) return "₹50K–1L";
  return "₹1L+";
}

export const STATUSES = [
  "pending",
  "approved",
  "featured",
  "rejected",
  "archived",
] as const;

export type Status = (typeof STATUSES)[number];
