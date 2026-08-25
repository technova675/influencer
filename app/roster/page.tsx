import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
import { RosterFilters } from "@/components/roster-filters";
import { fetchCreators, type RosterFilters as Filters } from "@/lib/queries";
import type { Tier } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "The roster",
  description:
    "Filter Indian creators by genre, follower tier, city, language and budget.",
};

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const rate = Number(one("maxReelRate"));
  const page = Number(one("page"));
  const sort = one("sort");

  return {
    q: one("q"),
    genre: one("genre"),
    tier: one("tier") as Tier | undefined,
    city: one("city"),
    language: one("language"),
    maxReelRate: Number.isFinite(rate) && rate > 0 ? rate : undefined,
    sort:
      sort === "followers" || sort === "recent" || sort === "engagement"
        ? sort
        : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: 24,
  };
}

async function Results({ filters }: { filters: Filters }) {
  let result;
  try {
    result = await fetchCreators(filters);
  } catch {
    return (
      <p className="py-24 text-center text-ink-soft">
        The roster is not reachable yet. Run{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">
          supabase/schema.sql
        </code>{" "}
        in the Supabase SQL editor, then reload.
      </p>
    );
  }

  const { creators, total, page, pageCount } = result;

  if (creators.length === 0) {
    return (
      <div className="py-24 text-center">
        <h2 className="display-sm text-2xl">No creators match that yet</h2>
        <p className="measure mx-auto mt-3 text-ink-soft">
          Widen the tier or drop a filter. If the roster is brand new, the first
          approved profiles will show up here.
        </p>
        <Link href="/roster" className="btn btn-ghost mt-7">
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-7 text-sm text-ink-faint">
        <span className="tabular font-medium text-ink">{total}</span>{" "}
        {total === 1 ? "creator" : "creators"}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>

      {pageCount > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Pagination">
          <PageLink filters={filters} page={page - 1} disabled={page <= 1}>
            Previous
          </PageLink>
          <span className="tabular text-sm text-ink-soft">
            {page} of {pageCount}
          </span>
          <PageLink filters={filters} page={page + 1} disabled={page >= pageCount}>
            Next
          </PageLink>
        </nav>
      )}
    </>
  );
}

function PageLink({
  filters,
  page,
  disabled,
  children,
}: {
  filters: Filters;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="btn btn-ghost cursor-not-allowed opacity-40">
        {children}
      </span>
    );
  }
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v != null && v !== "" && k !== "page" && k !== "perPage") {
      sp.set(k, String(v));
    }
  }
  sp.set("page", String(page));
  return (
    <Link href={`/roster?${sp}`} className="btn btn-ghost">
      {children}
    </Link>
  );
}

function Skeletons() {
  return (
    <div className="mt-13 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card h-64 animate-pulse bg-black/[0.03]" />
      ))}
    </div>
  );
}

export default async function RosterPage(props: PageProps<"/roster">) {
  const sp = await props.searchParams;
  const filters = parseFilters(sp);

  return (
    <>
      <SiteNav />

      <main className="ground-2 flex-1 px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="py-12 sm:py-16">
            <p className="overline">For brands</p>
            <h1 className="display mt-4 text-[clamp(2.25rem,6vw,3.75rem)]">
              The roster
            </h1>
            <p className="measure mt-5 leading-relaxed text-ink-soft">
              Every creator here is reviewed and approved. Filter the way a
              brief reads — genre, tier, city, language, budget.
            </p>
          </header>

          <Suspense fallback={null}>
            <RosterFilters />
          </Suspense>

          <Suspense key={JSON.stringify(filters)} fallback={<Skeletons />}>
            <Results filters={filters} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
