import "server-only";
import { adminClient } from "./supabase";
import {
  GENRES,
  MODEL_CATEGORIES,
  TIERS,
  type ExperienceLevel,
  type Status,
  type TalentType,
  type Tier,
} from "./taxonomy";

/** The `model_profiles` row hanging off a creator. Null for everyone else. */
export type ModelProfile = {
  height_cm: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  dress_size: string | null;
  shoe_size: string | null;
  hair_colour: string | null;
  eye_colour: string | null;
  visible_tattoos: boolean;
  model_categories: string[];
  experience_level: ExperienceLevel | null;
  agency_signed: boolean;
  agency_name: string | null;
  rate_half_day: number | null;
  rate_full_day: number | null;
  travel_willing: boolean;
  buyout_terms: string | null;
};

export type CreatorRow = {
  id: string;
  created_at: string;
  full_name: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  languages: string[];
  talent_type: TalentType;
  primary_genre: string;
  secondary_genres: string[];
  content_formats: string[];
  instagram_handle: string | null;
  youtube_handle: string | null;
  tiktok_handle: string | null;
  x_handle: string | null;
  portfolio_url: string | null;
  profile_photo_path: string | null;
  showcase_media_paths: string[];
  avg_reel_views: number | null;
  effective_followers: number;
  effective_engagement_rate: number | null;
  is_verified: boolean;
  audience_female_pct: number | null;
  audience_age_band: string | null;
  rate_reel: number | null;
  rate_story: number | null;
  rate_static_post: number | null;
  rate_youtube_integration: number | null;
  rate_video: number | null;
  turnaround_days: number | null;
  barter_open: boolean;
  past_brands: string[];
  status: Status;
  internal_notes: string | null;
  model_profile: ModelProfile | null;
};

export type RosterFilters = {
  q?: string;
  /** "influencer" and "creator" both include people who do `both`. */
  talent?: TalentType;
  genre?: string;
  tier?: Tier;
  city?: string;
  language?: string;
  maxReelRate?: number;
  /* Model-only. Ignored unless the roster is showing models. */
  modelCategory?: string;
  minHeight?: number;
  maxDayRate?: number;
  status?: Status | "all";
  sort?: "followers" | "recent" | "engagement";
  page?: number;
  perPage?: number;
};

/** Public roster: approved + featured only, and never contact details. */
const PUBLIC_COLUMNS =
  "id,created_at,full_name,display_name,bio,city,state,languages,talent_type,primary_genre," +
  "secondary_genres,content_formats,instagram_handle,youtube_handle,tiktok_handle," +
  "x_handle,portfolio_url,profile_photo_path,showcase_media_paths,avg_reel_views,effective_followers," +
  "effective_engagement_rate,is_verified,audience_female_pct,audience_age_band," +
  "rate_reel,rate_story,rate_static_post,rate_youtube_integration,rate_video," +
  "turnaround_days," +
  "barter_open,past_brands,status";

/** Everything on the one-to-one `model_profiles` row. */
const MODEL_COLUMNS =
  "height_cm,bust_cm,waist_cm,hips_cm,dress_size,shoe_size,hair_colour," +
  "eye_colour,visible_tattoos,model_categories,experience_level,agency_signed," +
  "agency_name,rate_half_day,rate_full_day,travel_willing,buyout_terms";

export async function fetchCreators(
  filters: RosterFilters,
  { includePrivate = false }: { includePrivate?: boolean } = {},
) {
  const perPage = filters.perPage ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * perPage;

  const base = includePrivate
    ? `${PUBLIC_COLUMNS},email,phone,internal_notes`
    : PUBLIC_COLUMNS;

  // Any filter that reads a model column has to become an inner join, or
  // PostgREST applies it to the embedded row and still returns the parent with
  // an empty embed - which reads as "no filter applied" rather than "excluded".
  const modelFilter =
    filters.modelCategory != null ||
    filters.minHeight != null ||
    filters.maxDayRate != null;

  const columns =
    `${base},model_profile:model_profiles${modelFilter ? "!inner" : ""}(${MODEL_COLUMNS})`;

  let query = adminClient()
    .from("creators")
    .select(columns, { count: "exact" });

  if (includePrivate) {
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
  } else {
    query = query.in("status", ["approved", "featured"]);
  }

  // Somebody who does `both` belongs in either set of results, so this is an
  // `in` rather than an `eq`.
  if (filters.talent === "influencer") {
    query = query.in("talent_type", ["influencer", "both"]);
  } else if (filters.talent === "creator") {
    query = query.in("talent_type", ["creator", "both"]);
  } else if (filters.talent === "both") {
    query = query.eq("talent_type", "both");
  } else if (filters.talent === "model") {
    // A model is only ever a model - there is no "both" overlap to fold in.
    query = query.eq("talent_type", "model");
  }

  // `genre` is interpolated into a PostgREST or() expression, which is a query
  // language - so it is matched against the known list rather than escaped.
  // An unknown value is ignored instead of being passed through.
  if (filters.genre && (GENRES as readonly string[]).includes(filters.genre)) {
    query = query.or(
      `primary_genre.eq.${filters.genre},secondary_genres.cs.{"${filters.genre}"}`,
    );
  }
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.language) query = query.contains("languages", [filters.language]);

  if (filters.tier) {
    const tier = TIERS.find((t) => t.id === filters.tier);
    if (tier) {
      query = query.gte("effective_followers", tier.min);
      if (tier.max !== null) {
        query = query.lte("effective_followers", tier.max);
      }
    }
  }

  if (filters.maxReelRate != null) {
    query = query.lte("rate_reel", filters.maxReelRate);
  }

  // ----- model filters. Same reasoning as `genre`: the category lands in a
  // PostgREST expression, so it is matched against the known list rather than
  // escaped, and an unknown value is ignored instead of passed through.
  if (
    filters.modelCategory &&
    (MODEL_CATEGORIES as readonly string[]).includes(filters.modelCategory)
  ) {
    query = query.contains("model_profiles.model_categories", [
      filters.modelCategory,
    ]);
  }
  if (filters.minHeight != null) {
    query = query.gte("model_profiles.height_cm", filters.minHeight);
  }
  if (filters.maxDayRate != null) {
    query = query.lte("model_profiles.rate_full_day", filters.maxDayRate);
  }

  if (filters.q?.trim()) {
    // Same reasoning as `genre`: this lands inside an or() expression, so keep
    // it to characters that cannot be read as PostgREST syntax. Anything that
    // could act as an operator, separator or wildcard is dropped.
    const term = filters.q
      .trim()
      .replace(/[^\p{L}\p{N}\s._@-]/gu, " ")
      .replace(/\s+/g, " ")
      .slice(0, 60)
      .trim();
    // If sanitising removed everything, run the query without a text filter
    // rather than matching on an empty string.
    if (term) {
      query = query.or(
        `full_name.ilike.%${term}%,display_name.ilike.%${term}%,` +
          `instagram_handle.ilike.%${term}%,primary_genre.ilike.%${term}%,city.ilike.%${term}%`,
      );
    }
  }

  // Models have no follower count, so the default "featured, then by reach"
  // order would stack every one of them at the bottom in submission order.
  // Newest first is the only ranking that means anything for them.
  const sort =
    filters.sort ?? (filters.talent === "model" ? "recent" : undefined);

  switch (sort) {
    case "recent":
      query = query.order("created_at", { ascending: false });
      break;
    case "engagement":
      query = query.order("effective_engagement_rate", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    default:
      // Featured first, then by reach.
      query = query
        .order("status", { ascending: false })
        .order("effective_followers", { ascending: false });
  }

  const { data, error, count } = await query.range(from, from + perPage - 1);
  if (error) throw new Error(`Roster query failed: ${error.message}`);

  // PostgREST embeds a to-one relation as an object, but returns an array if
  // it cannot see the relation as unique. Normalise here so nothing further up
  // has to know which shape it got.
  const creators = (data ?? []).map((row) => {
    const r = row as unknown as CreatorRow & {
      model_profile: ModelProfile | ModelProfile[] | null;
    };
    return {
      ...r,
      model_profile: Array.isArray(r.model_profile)
        ? (r.model_profile[0] ?? null)
        : r.model_profile,
    } as CreatorRow;
  });

  return {
    creators,
    total: count ?? 0,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  };
}

export async function fetchStats() {
  const db = adminClient();
  const live = ["approved", "featured"];
  const [total, approved, pending, cities, influencers, creatorCount, models] = await Promise.all([
    db.from("creators").select("id", { count: "exact", head: true }),
    db
      .from("creators")
      .select("id", { count: "exact", head: true })
      .in("status", live),
    db
      .from("creators")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db.from("creators").select("city").not("city", "is", null).limit(1000),
    db
      .from("creators")
      .select("id", { count: "exact", head: true })
      .in("status", live)
      .in("talent_type", ["influencer", "both"]),
    db
      .from("creators")
      .select("id", { count: "exact", head: true })
      .in("status", live)
      .in("talent_type", ["creator", "both"]),
    db
      .from("creators")
      .select("id", { count: "exact", head: true })
      .in("status", live)
      .eq("talent_type", "model"),
  ]);

  const uniqueCities = new Set(
    (cities.data ?? []).map((r) => (r as { city: string }).city),
  );

  return {
    total: total.count ?? 0,
    approved: approved.count ?? 0,
    pending: pending.count ?? 0,
    cities: uniqueCities.size,
    influencers: influencers.count ?? 0,
    creators: creatorCount.count ?? 0,
    models: models.count ?? 0,
  };
}

export async function fetchCreatorById(id: string) {
  const { data, error } = await adminClient()
    .from("creators")
    .select(`*,model_profile:model_profiles(${MODEL_COLUMNS})`)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as CreatorRow;
}
