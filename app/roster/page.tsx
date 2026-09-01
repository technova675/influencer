import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
import { RosterFilters } from "@/components/roster-filters";
import { fetchCreators, type RosterFilters as Filters } from "@/lib/queries";
import type { TalentType, Tier } from "@/lib/taxonomy";
import { TALENT_TYPE_IDS } from "@/lib/taxonomy";
import { isAuthed } from "@/lib/auth";
import { LoginForm } from "@/app/admin/login-form";

export const metadata: Metadata = {
  title: "The roster",
  description:
    "The agency's internal roster of influencers, creators and models.",
  // The roster is the agency's asset and it now requires a session, so there
  // is nothing here for a crawler to have.
  robots: { index: false, follow: false },
};

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const positive = (v: string | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const rate = Number(one("maxReelRate"));
  const page = Number(one("page"));
  const sort = one("sort");

  const talent = one("talent");

  return {
    q: one("q"),
    talent: (TALENT_TYPE_IDS as readonly string[]).includes(talent ?? "")
      ? (talent as TalentType)
      : undefined,
    genre: one("genre"),
    tier: one("tier") as Tier | undefined,
    city: one("city"),
    language: one("language"),
    maxReelRate: Number.isFinite(rate) && rate > 0 ? rate : undefined,
    modelCategory: one("modelCategory"),
    minHeight: positive(one("minHeight")),
    maxDayRate: positive(one("maxDayRate")),
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
        <h2 className="display-sm text-2xl">Nobody matches that yet</h2>
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
      <p className="mono mt-7 text-xs uppercase tracking-[0.09em] text-ink-faint">
        <span className="tabular font-medium text-ink">{total}</span>{" "}
        {filters.talent === "creator"
          ? total === 1
            ? "Creator"
            : "Creators"
          : filters.talent === "influencer"
            ? total === 1
              ? "influencer"
              : "influencers"
            : filters.talent === "model"
              ? total === 1
                ? "model"
                : "models"
              : total === 1
                ? "profile"
                : "profiles"}
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
          <span className="tabular text-xs text-ink-soft">
            {page} / {pageCount}
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
        <div key={i} className="card h-64 animate-pulse bg-black/[0.04]" />
      ))}
    </div>
  );
}

/**
 * The roster is not public. Talent must not be able to see each other's
 * profiles or each other's rates, and that is a promise a filtered view cannot
 * keep - so the whole page sits behind the agency session, and an unsigned-in
 * visitor is told what to do instead of being shown a single card.
 */
function Gate() {
  return (
    <>
      <SiteNav />

      <main className="ground-2 flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-4xl items-start gap-12 md:grid-cols-2">
          <div>
            <p className="overline">Private</p>
            <h1 className="display mt-5 text-[clamp(2rem,5vw,3rem)]">
              The roster isn&rsquo;t public.
            </h1>
            <p className="measure mt-5 leading-relaxed text-ink-soft">
              Names, rates and contact details belong to the people on it. We
              don&rsquo;t publish them, and nobody on the roster can see anyone
              else&rsquo;s.
            </p>
            <p className="measure mt-4 leading-relaxed text-ink-soft">
              <strong className="font-medium text-ink">Hiring?</strong> Send us
              the brief and we&rsquo;ll come back with a shortlist — the
              profiles that fit it, and nothing else.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/for-brands" className="btn btn-accent">
                Send us a brief
              </Link>
              <Link href="/join" className="btn btn-ghost">
                I&rsquo;m talent — add me
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <LoginForm
              redirectTo="/roster"
              heading="Agency sign in"
              blurb="For the team. Everything behind this is internal."
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

export default async function RosterPage(props: PageProps<"/roster">) {
  if (!(await isAuthed())) return <Gate />;

  const sp = await props.searchParams;
  const filters = parseFilters(sp);

  return (
    <>
      <SiteNav />

      <main className="ground-2 flex-1 px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="py-12 sm:py-16">
            <p className="overline flex items-center gap-2.5">
              <span
                className="inline-block h-[7px] w-[7px] shrink-0 bg-signal"
                aria-hidden
              />
              Internal
            </p>
            <h1 className="display mt-5 text-[clamp(2.25rem,6vw,3.75rem)]">
              The roster
            </h1>
            <p className="measure mt-5 leading-relaxed text-ink-soft">
              Every profile here is reviewed and approved. Three kinds of
              talent, kept apart on purpose:{" "}
              <strong className="font-medium text-ink">influencers</strong> post
              to their own audience,{" "}
              <strong className="font-medium text-ink">Creators</strong>{" "}
              shoot content the brand runs as its own ad, and{" "}
              <strong className="font-medium text-ink">models</strong> are
              booked for the day. Switch between them below.
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
