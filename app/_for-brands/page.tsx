import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
import { TalentExplainer } from "@/components/two-door";
import { Ticker } from "@/components/ticker";
import { ROLE_LIST } from "@/lib/roles";
import { fetchCreators, fetchStats } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "For brands",
  description:
    "A reviewed roster of influencers and creators, filtered by genre, tier, city, language and budget — with rates on every card.",
};

const STEPS = [
  {
    n: "01",
    t: "Decide what you're buying",
    d: "A placement on someone's audience, or footage you run as your own ad. The roster keeps the two apart, so you never compare a follower count against a turnaround time.",
  },
  {
    n: "02",
    t: "Turn the brief into a filter",
    d: "Fitness creators, micro tier, Mumbai, Hindi, under ₹40,000 a reel. One query instead of an afternoon of scrolling.",
  },
  {
    n: "03",
    t: "Read the rates before the call",
    d: "Every card carries reach, engagement and a rate card in rupees. Nothing is gated behind a demo.",
  },
  {
    n: "04",
    t: "Share the shortlist",
    d: "Export the matching profiles as a media kit the client can read, rates and reach already attached.",
  },
];

const DIFFERENTIATORS = [
  {
    n: "Verify",
    t: "Reviewed, not scraped",
    d: "Nothing is public until a talent manager approves it. Self-reported numbers are held separately from verified ones, so a shortlist is never built on a guess.",
  },
  {
    n: "Benchmark",
    t: "Rates upfront, in rupees",
    d: "Per reel, per story, per post, per Video. You know the budget fits before you write the first email.",
  },
  {
    n: "Track",
    t: "Filters that match the brief",
    d: "City, language and tier are first-class filters, because that is how a brief is actually written.",
  },
];

export default async function ForBrandsPage() {
  const [stats, featured] = await Promise.all([
    fetchStats().catch(() => ({
      total: 0,
      approved: 0,
      pending: 0,
      cities: 0,
      influencers: 0,
      creators: 0,
      models: 0,
    })),
    fetchCreators({ perPage: 3, sort: "followers" })
      .then((r) => r.creators)
      .catch(() => []),
  ]);

  return (
    <>
      <SiteNav role="brand" />

      <main className="flex-1">
        {/* ---------------- Hero ---------------- */}
        <section className="ground-1">
          <div className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-16">
            <p className="overline reveal flex items-center gap-2.5">
              <span
                className="inline-block h-[7px] w-[7px] shrink-0 bg-signal"
                aria-hidden
              />
              For brands and agencies
            </p>
            <h1 className="display reveal mt-6 max-w-4xl text-[clamp(2.5rem,7vw,4.5rem)]">
              Brief it like paid media.
              <br />
              Get the shortlist back today.
            </h1>
            <p className="measure reveal mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              A reviewed roster of influencers, creators and models — each
              carrying the numbers you already buy on. Filter by genre, tier,
              city, language, casting and budget, and get a shortlist the same
              day, rates already attached.
            </p>
            <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#brief" className="btn btn-accent w-full sm:w-auto">
                Send us a brief &rarr;
              </Link>
              <Link href="#how" className="btn btn-ghost w-full sm:w-auto">
                How it works
              </Link>
            </div>
          </div>

          {/* The three rosters quoted in their three units, running together.
              A buyer reading this already knows which line item they need. */}
          <div className="reveal">
            <Ticker
              items={ROLE_LIST.flatMap((r) => r.ticker.slice(0, 3))}
              label="Indicative rates across influencers, creators and models"
            />
          </div>

          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="stat-band reveal grid-cols-2 sm:grid-cols-4">
              <div>
                <div className="stat-figure text-3xl">
                  {stats.influencers > 0 ? stats.influencers : "—"}
                </div>
                <div className="overline mt-1.5">Influencers</div>
              </div>
              <div>
                <div className="stat-figure text-3xl">
                  {stats.creators > 0 ? stats.creators : "—"}
                </div>
                <div className="overline mt-1.5">Creators</div>
              </div>
              <div>
                <div className="stat-figure text-3xl">
                  {stats.models > 0 ? stats.models : "—"}
                </div>
                <div className="overline mt-1.5">Models</div>
              </div>
              <div>
                <div className="stat-figure text-3xl">
                  {stats.cities > 0 ? stats.cities : "—"}
                </div>
                <div className="overline mt-1.5">Cities covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Which do you need ---------------- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="overline">Three line items, kept separate</p>
                <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
                  Which one does this brief need?
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
                Buying reach and buying footage are two different purchases at
                two different prices. The roster keeps them on separate tabs so
                a comparison is always like for like.
              </p>
            </div>
            <div className="mt-11">
              <TalentExplainer
                counts={{
                  influencers: stats.influencers,
                  creators: stats.creators,
                  models: stats.models,
                }}
              />
            </div>
          </div>
        </section>

        {/* ---------------- Why this roster ---------------- */}
        <section className="ground-3 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="overline reveal">How the roster is scored</p>
            <h2 className="display-sm reveal mt-4 max-w-2xl text-[clamp(1.75rem,4vw,2.5rem)]">
              Why this roster and not a spreadsheet
            </h2>
            <div className="ledger reveal mt-11 md:grid-cols-3">
              {DIFFERENTIATORS.map((d, i) => (
                <div key={d.t} className="p-7 sm:p-8">
                  <span className="figure-plain text-xs text-signal">
                    {String(i + 1).padStart(2, "0")} / {d.n}
                  </span>
                  <h3 className="display-sm mt-4 text-lg">{d.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {d.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Sample shortlist ---------------- */}
        {featured.length > 0 && (
          <section className="ground-4 px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="reveal flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="overline">A sample of the roster</p>
                  <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
                    What a shortlist looks like
                  </h2>
                  <p className="measure mt-4 leading-relaxed text-ink-soft">
                    Reach, engagement and rate card on every influencer.
                    Samples, turnaround and per-video price on every creator.
                    Digitals, measurements and day rate on every
                    model. Full names and exact rates come with the shortlist.
                  </p>
                </div>
                <Link href="#how" className="btn btn-ghost">
                  How it works
                </Link>
              </div>
              <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((c) => (
                  <CreatorCard key={c.id} creator={c} redacted />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="ground-5 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <p className="overline reveal">Brief in, shortlist out</p>
            <h2 className="display-sm reveal mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
              Four steps, no demo call
            </h2>
            <ol className="mt-14 space-y-12">
              {STEPS.map((s) => (
                <li key={s.n} className="reveal flex gap-6 sm:gap-8">
                  <span className="figure-plain shrink-0 text-2xl text-ink-faint">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="display-sm text-xl sm:text-2xl">{s.t}</h3>
                    <p className="measure mt-2.5 leading-relaxed text-ink-soft">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div
              id="brief"
              className="ground-ink reveal mt-16 p-8 sm:p-10"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="overline" style={{ color: "#a6a8a0" }}>
                Send a brief
              </p>
              <h3 className="display-sm mt-3 text-2xl">
                Tell us the campaign, get the shortlist
              </h3>
              <p className="measure mt-3 leading-relaxed text-ink-soft">
                Category, market, deliverable, timing and budget is enough to
                start. We filter the roster against it and come back with names,
                rates and availability — usually the same day.
              </p>
              <div className="mt-7">
                <a
                  href="mailto:hello@adbibe.com?subject=Campaign%20brief"
                  className="btn btn-primary"
                >
                  Email us the brief &rarr;
                </a>
              </div>
              <p className="mono mt-5 text-xs text-ink-faint">
                Prefer to browse yourself? The roster is private — ask us for
                access.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter role="brand" />
    </>
  );
}
