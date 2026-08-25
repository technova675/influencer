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
