import { NextResponse, type NextRequest } from "next/server";
import { isAuthed } from "@/lib/auth";
import { fetchCreators } from "@/lib/queries";
import type { Status, Tier } from "@/lib/taxonomy";

const COLUMNS = [
  "full_name",
  "display_name",
  "email",
  "phone",
  "city",
  "state",
  "primary_genre",
  "secondary_genres",
  "languages",
  "instagram_handle",
  "youtube_handle",
  "x_handle",
  "effective_followers",
  "effective_engagement_rate",
  "avg_reel_views",
  "is_verified",
  "rate_reel",
  "rate_story",
  "rate_static_post",
  "rate_youtube_integration",
  "rate_ugc_video",
  "barter_open",
  "past_brands",
  "status",
  "internal_notes",
  "created_at",
] as const;

/** RFC 4180 quoting, plus a guard against spreadsheet formula injection. */
function cell(value: unknown) {
  if (value === null || value === undefined) return "";
  const raw = Array.isArray(value) ? value.join("; ") : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthed())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const { creators } = await fetchCreators(
    {
      q: sp.get("q") ?? undefined,
      genre: sp.get("genre") ?? undefined,
      city: sp.get("city") ?? undefined,
      language: sp.get("language") ?? undefined,
      tier: (sp.get("tier") as Tier) ?? undefined,
      status: (sp.get("status") as Status) ?? "all",
      sort: "recent",
      perPage: 5000,
    },
    { includePrivate: true },
  );

  const rows = [
    COLUMNS.join(","),
    ...creators.map((c) =>
      COLUMNS.map((k) => cell((c as Record<string, unknown>)[k])).join(","),
    ),
  ];

  // BOM so Excel reads the UTF-8 correctly.
  const csv = `﻿${rows.join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="creator-roster-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
