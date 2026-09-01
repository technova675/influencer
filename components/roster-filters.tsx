"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  CITIES,
  GENRES,
  LANGUAGES,
  MODEL_CATEGORIES,
  TIERS,
} from "@/lib/taxonomy";

const TALENT_TABS = [
  { value: "", label: "Everyone" },
  { value: "influencer", label: "Influencers" },
  { value: "creator", label: "Creators" },
  { value: "model", label: "Models" },
] as const;

/** Casting filters on height, so the bands are the ones a brief is written in. */
const HEIGHT_BANDS = [
  { value: "165", label: "165cm and up" },
  { value: "170", label: "170cm and up" },
  { value: "175", label: "175cm and up" },
  { value: "180", label: "180cm and up" },
] as const;

export function RosterFilters({ basePath = "/roster" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const push = useCallback(
    (next: URLSearchParams) => {
      next.delete("page"); // any filter change resets pagination
      startTransition(() => {
        router.replace(`${basePath}?${next.toString()}`, { scroll: false });
      });
    },
    [router, basePath],
  );

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Switching tab hides some filters, so it has to drop them too -
      // otherwise a tier left over from the influencer view keeps filtering
      // invisibly and the roster looks empty for no stated reason.
      if (key === "talent") {
        if (value === "creator" || value === "model") {
          next.delete("tier");
          next.delete("maxReelRate");
        }
        if (value !== "model") {
          next.delete("modelCategory");
          next.delete("minHeight");
          next.delete("maxDayRate");
        }
      }
      push(next);
    },
    [params, push],
  );

  // Debounce the text search so we are not querying on every keystroke.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => set("q", q), 350);
    return () => clearTimeout(t);
  }, [q, params, set]);

  const active = [
    "talent",
    "genre",
    "tier",
    "city",
    "language",
    "maxReelRate",
    "modelCategory",
    "minHeight",
    "maxDayRate",
    "q",
  ].filter((k) => params.get(k)).length;

  const talent = params.get("talent") ?? "";

  // Follower tier and a reel budget are properties of selling reach. With the
  // roster switched to creators or models only they would filter every result to
  // nothing, so they come off the bar entirely rather than sitting there
  // returning zero. The casting filters appear only on the models tab for the
  // same reason, in reverse.
  const showReachFilters = talent !== "creator" && talent !== "model";
  const showModelFilters = talent === "model";

  const selectCls =
    "field !py-1.5 !text-xs !w-auto min-w-0 cursor-pointer appearance-none pr-8 font-mono " +
    "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 12%22><path fill=%22%236b6e63%22 d=%22M6 8L2 4h8z%22/></svg>')] " +
    "bg-[length:12px] bg-[right_0.6rem_center] bg-no-repeat";

  return (
    <div
      className="sticky top-[57px] z-40 -mx-5 border-y border-line bg-[color-mix(in_srgb,var(--paper-2)_94%,transparent)] px-5 py-3.5 backdrop-blur-md sm:-mx-8 sm:px-8"
      data-pending={pending || undefined}
    >
      <div className="mx-auto max-w-6xl">
        <div className="segmented" role="group" aria-label="Filter by what they sell">
          {TALENT_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              data-active={talent === t.value || undefined}
              aria-pressed={talent === t.value}
              onClick={() => set("talent", t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-2.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, handle, city…"
          aria-label="Search creators"
          className="field !py-1.5 !text-xs w-full font-mono sm:w-64"
        />

        <select
          value={params.get("genre") ?? ""}
          onChange={(e) => set("genre", e.target.value)}
          aria-label="Filter by genre"
          className={selectCls}
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        {showReachFilters && (
          <select
            value={params.get("tier") ?? ""}
            onChange={(e) => set("tier", e.target.value)}
            aria-label="Filter by follower tier"
            className={selectCls}
          >
            <option value="">All tiers</option>
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
                {t.max
                  ? ` (${(t.min / 1000).toFixed(0)}K–${((t.max + 1) / 1000).toFixed(0)}K)`
                  : " (1M+)"}
              </option>
            ))}
          </select>
        )}

        <select
          value={params.get("city") ?? ""}
          onChange={(e) => set("city", e.target.value)}
          aria-label="Filter by city"
          className={selectCls}
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={params.get("language") ?? ""}
          onChange={(e) => set("language", e.target.value)}
          aria-label="Filter by language"
          className={selectCls}
        >
          <option value="">Any language</option>
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        {showReachFilters && (
          <select
            value={params.get("maxReelRate") ?? ""}
            onChange={(e) => set("maxReelRate", e.target.value)}
            aria-label="Filter by maximum reel rate"
            className={selectCls}
          >
            <option value="">Any budget</option>
            <option value="10000">Reel under ₹10K</option>
            <option value="25000">Reel under ₹25K</option>
            <option value="50000">Reel under ₹50K</option>
            <option value="100000">Reel under ₹1L</option>
          </select>
        )}

        {showModelFilters && (
          <>
            <select
              value={params.get("modelCategory") ?? ""}
              onChange={(e) => set("modelCategory", e.target.value)}
              aria-label="Filter by what they are cast for"
              className={selectCls}
            >
              <option value="">Cast for anything</option>
              {MODEL_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={params.get("minHeight") ?? ""}
              onChange={(e) => set("minHeight", e.target.value)}
              aria-label="Filter by minimum height"
              className={selectCls}
            >
              <option value="">Any height</option>
              {HEIGHT_BANDS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>

            <select
              value={params.get("maxDayRate") ?? ""}
              onChange={(e) => set("maxDayRate", e.target.value)}
              aria-label="Filter by maximum day rate"
              className={selectCls}
            >
              <option value="">Any day rate</option>
              <option value="10000">Day under ₹10K</option>
              <option value="25000">Day under ₹25K</option>
              <option value="50000">Day under ₹50K</option>
              <option value="100000">Day under ₹1L</option>
            </select>
          </>
        )}

        <select
          value={params.get("sort") ?? ""}
          onChange={(e) => set("sort", e.target.value)}
          aria-label="Sort"
          className={selectCls}
        >
          <option value="">Featured first</option>
          <option value="followers">Most followers</option>
          <option value="engagement">Best engagement</option>
          <option value="recent">Recently added</option>
        </select>

        {active > 0 && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(basePath, { scroll: false }));
            }}
            className="text-sm text-ink-faint underline underline-offset-4 hover:text-ink"
          >
            Clear {active}
          </button>
        )}
      </div>
    </div>
  );
}
