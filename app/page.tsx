import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
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
    fetchStats().catch(() => ({ total: 0, approved: 0, pending: 0, cities: 0 })),
    fetchCreators({ perPage: 3, sort: "followers" })
      .then((r) => r.creators)
      .catch(() => []),
  ]);

  return (
    <>
      <SiteNav />

      <main className="flex-1">
        {/* ---------------- Hero ---------------- */}
        <section className="ground-1 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="overline reveal">For brands and talent managers</p>
            <h1 className="display reveal mt-5 text-[clamp(2.5rem,7vw,4.75rem)]">
              The creators your
              <br />
              brief is describing.
            </h1>
            <p className="measure reveal mx-auto mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              A live roster of Indian creators across every genre, tier and
              city. Filter by audience, format and budget, and get a shortlist
              the same day — not a spreadsheet three days later.
            </p>

            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/roster" className="btn btn-accent w-full sm:w-auto">
                Browse the roster
              </Link>
              <Link href="/join" className="btn btn-ghost w-full sm:w-auto">
                I&rsquo;m a creator
              </Link>
            </div>

            <div className="reveal mt-16 grid grid-cols-3 gap-6 border-t border-line/70 pt-10">
              <Stat
                figure={stats.approved > 0 ? `${stats.approved}+` : "—"}
                label="creators on the roster"
              />
              <Stat
                figure={stats.cities > 0 ? String(stats.cities) : "—"}
                label="cities covered"
              />
              <Stat figure="24h" label="to a shortlist" />
            </div>
          </div>
        </section>

        {/* ---------------- Genres ---------------- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
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
          <section className="ground-3 px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="reveal flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="display-sm text-[clamp(1.75rem,4vw,2.75rem)]">
                    What a shortlist looks like
                  </h2>
                  <p className="measure mt-4 leading-relaxed text-ink-soft">
                    Reach, engagement and rate card on every card, before anyone
                    gets on a call.
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

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="ground-4 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="display-sm reveal text-center text-[clamp(1.75rem,4vw,2.75rem)]">
              Brief in, shortlist out
            </h2>

            <ol className="mt-14 space-y-12">
              {[
                {
                  n: "01",
                  t: "Creators add themselves",
                  d: "One form: handles, genre, audience split, city, languages and a rate card per deliverable. It lands in the database the moment they submit.",
                },
                {
                  n: "02",
                  t: "The agency verifies and approves",
                  d: "Nothing is public until a talent manager approves it. Self-reported numbers stay separate from verified ones, so a shortlist is never built on a guess.",
                },
                {
                  n: "03",
                  t: "A client brief becomes a filter",
                  d: "Fitness creators, micro tier, Mumbai, Hindi, under ₹40,000 a reel. The roster answers in one query instead of an afternoon of scrolling.",
                },
                {
                  n: "04",
                  t: "Share the shortlist",
                  d: "Export the matching creators as a media kit the client can read, with rates and reach already on every card.",
                },
              ].map((step) => (
                <li key={step.n} className="reveal flex gap-6 sm:gap-8">
                  <span className="figure-plain shrink-0 text-2xl text-ink-faint">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="display-sm text-xl sm:text-2xl">{step.t}</h3>
                    <p className="measure mt-2.5 leading-relaxed text-ink-soft">
                      {step.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

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
                Add yourself to the roster
              </Link>
              <Link href="/roster" className="btn btn-ghost w-full sm:w-auto">
                Browse as a brand
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
