import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
import { TalentExplainer, TwoDoor } from "@/components/two-door";
import { fetchCreators, fetchStats } from "@/lib/queries";
import { GENRES, compactNumber } from "@/lib/taxonomy";

export const revalidate = 60;

function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div>
      <div className="stat-figure tabular text-4xl sm:text-5xl">{figure}</div>
      <div className="mt-2 text-sm text-ink-soft">{label}</div>
    </div>
  );
}

export default async function HomePage() {
  // The landing page degrades to a working marketing page if the database is
  // not reachable yet - useful before the schema has been run.
  const [stats, featured] = await Promise.all([
    fetchStats().catch(() => ({
      total: 0,
      approved: 0,
      pending: 0,
      cities: 0,
      influencers: 0,
      ugc: 0,
    })),
    fetchCreators({ perPage: 3, sort: "followers" })
      .then((r) => r.creators)
      .catch(() => []),
  ]);

  return (
    <>
      <SiteNav />

      <main className="flex-1">
        {/* ---------------- Hero ---------------- */}
        <section className="ground-1 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="overline reveal">
                One roster of creators, influencers and UGC talent
              </p>
              <h1 className="display reveal mt-5 text-[clamp(2.5rem,7vw,4.75rem)]">
                Get paid for
                <br />
                what you make.
              </h1>
              <p className="measure reveal mx-auto mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
                List yourself free, set your own rates, and turn up in the
                filters brands actually search — genre, city, language, budget.
                Brands: the same roster, already reviewed, with rates on every
                card.
              </p>
            </div>

            <div className="mt-11">
              <TwoDoor />
            </div>

            <div className="reveal mt-14 grid grid-cols-3 gap-6 border-t border-line/70 pt-10 text-center">
              <Stat
                figure={stats.approved > 0 ? `${stats.approved}+` : "—"}
                label="profiles on the roster"
              />
              <Stat
                figure={stats.cities > 0 ? String(stats.cities) : "—"}
                label="cities covered"
              />
              <Stat figure="Free" label="to list yourself" />
            </div>
          </div>
        </section>

        {/* ---------------- The distinction ---------------- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="overline">The difference</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
                Two ways to work with brands
              </h2>
              <p className="measure mx-auto mt-4 leading-relaxed text-ink-soft">
                Most rosters mix these into one list, which helps nobody. Here
                they are separate — different cards, different filters,
                different rates. Do one, or do both.
              </p>
            </div>
            <div className="mt-11">
              <TalentExplainer
                counts={{ influencers: stats.influencers, ugc: stats.ugc }}
              />
            </div>
          </div>
        </section>

        {/* ---------------- Genres ---------------- */}
        <section className="ground-3 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-2xl">
              <h2 className="display-sm text-[clamp(1.75rem,4vw,2.75rem)]">
                Every genre a brief asks for
              </h2>
              <p className="measure mt-4 leading-relaxed text-ink-soft">
                Sorted the way a client thinks about it, not the way a
                spreadsheet stores it.
              </p>
            </div>
            <div className="reveal mt-10 flex flex-wrap gap-2.5">
              {GENRES.map((g) => (
                <Link
                  key={g}
                  href={`/roster?genre=${encodeURIComponent(g)}`}
                  className="chip hover:!border-ink hover:!bg-ink hover:!text-white"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Featured creators ---------------- */}
        {featured.length > 0 && (
          <section className="ground-4 px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="reveal flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="display-sm text-[clamp(1.75rem,4vw,2.75rem)]">
                    What a profile looks like
                  </h2>
                  <p className="measure mt-4 leading-relaxed text-ink-soft">
                    Reach and rate card on an influencer. Samples, turnaround
                    and per-video price on a UGC creator. Never the same card
                    for both.
                  </p>
                </div>
                <Link href="/roster" className="btn btn-ghost">
                  See all
                </Link>
              </div>
              <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- Close ---------------- */}
        <section className="ground-5 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display reveal text-[clamp(2rem,5.5vw,3.5rem)]">
              {stats.approved > 0
                ? `${compactNumber(stats.approved)} creators, already sorted.`
                : "The roster starts with you."}
            </h2>
            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/join" className="btn btn-accent w-full sm:w-auto">
                Add yourself — free
              </Link>
              <Link href="/for-brands" className="btn btn-ghost w-full sm:w-auto">
                I&rsquo;m hiring creators
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
