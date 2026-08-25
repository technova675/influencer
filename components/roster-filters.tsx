"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CITIES, GENRES, LANGUAGES, TIERS } from "@/lib/taxonomy";

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

  const active = ["genre", "tier", "city", "language", "maxReelRate", "q"].filter(
    (k) => params.get(k),
  ).length;

  const selectCls =
    "field !py-2 !text-sm !w-auto min-w-0 cursor-pointer appearance-none pr-8 " +
    "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 12%22><path fill=%22%238c8c96%22 d=%22M6 8L2 4h8z%22/></svg>')] " +
    "bg-[length:12px] bg-[right_0.6rem_center] bg-no-repeat";

  return (
    <div
      className="sticky top-[57px] z-40 -mx-5 border-b border-line/70 bg-[color-mix(in_srgb,var(--ground-2)_92%,transparent)] px-5 py-3.5 backdrop-blur-md sm:-mx-8 sm:px-8"
      data-pending={pending || undefined}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, handle, city…"
          aria-label="Search creators"
          className="field !py-2 !text-sm w-full sm:w-64"
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
