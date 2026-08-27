import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorCard } from "@/components/creator-card";
import { TalentExplainer } from "@/components/two-door";
import { fetchCreators, fetchStats } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "For brands",
  description:
    "A reviewed roster of influencers and UGC creators, filtered by genre, tier, city, language and budget — with rates on every card.",
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
    t: "Reviewed, not scraped",
    d: "Nothing is public until a talent manager approves it. Self-reported numbers are held separately from verified ones, so a shortlist is never built on a guess.",
  },
  {
    t: "Rates upfront, in rupees",
    d: "Per reel, per story, per post, per UGC video. You know the budget fits before you write the first email.",
  },
  {
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
          <div className="mx-auto max-w-3xl text-center">
            <p className="overline reveal">For brands and agencies</p>
            <h1 className="display reveal mt-5 text-[clamp(2.5rem,7vw,4.5rem)]">
              Find the right creator
              <br />
              in minutes.
            </h1>
            <p className="measure reveal mx-auto mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              A reviewed roster of influencers and UGC creators. Filter
              by genre, tier, city, language and budget, and get a shortlist the
              same day — not a spreadsheet three days later.
            </p>
            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/roster" className="btn btn-accent w-full sm:w-auto">
                Browse the roster
              </Link>
              <Link
                href="/roster?talent=ugc_creator"
                className="btn btn-ghost w-full sm:w-auto"
              >
                I need UGC, not reach
              </Link>
            </div>

            <div className="reveal mt-14 grid grid-cols-3 gap-6 border-t border-line/70 pt-10">
              <div>
                <div className="stat-figure tabular text-4xl sm:text-5xl">
                  {stats.influencers > 0 ? stats.influencers : "—"}
                </div>
                <div className="mt-2 text-sm text-ink-soft">influencers</div>
              </div>
              <div>
                <div className="stat-figure tabular text-4xl sm:text-5xl">
                  {stats.ugc > 0 ? stats.ugc : "—"}
                </div>
                <div className="mt-2 text-sm text-ink-soft">UGC creators</div>
              </div>
              <div>
                <div className="stat-figure tabular text-4xl sm:text-5xl">
                  {stats.cities > 0 ? stats.cities : "—"}
                </div>
                <div className="mt-2 text-sm text-ink-soft">cities</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Which do you need ---------------- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="overline">Before you filter</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
                Which one does this brief need?
              </h2>
              <p className="measure mx-auto mt-4 leading-relaxed text-ink-soft">
                Buying reach and buying footage are two different purchases at
                two different prices. The roster keeps them on separate tabs so
                a comparison is always like for like.
              </p>
            </div>
            <div className="mt-11">
              <TalentExplainer
                counts={{ influencers: stats.influencers, ugc: stats.ugc }}
              />
            </div>
          </div>
        </section>

        {/* ---------------- Why this roster ---------------- */}
        <section className="ground-3 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="display-sm reveal max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)]">
              Why this roster and not a spreadsheet
            </h2>
            <div className="mt-11 grid gap-5 md:grid-cols-3">
              {DIFFERENTIATORS.map((d) => (
                <div key={d.t} className="card reveal p-6 sm:p-7">
                  <h3 className="display-sm text-xl">{d.t}</h3>
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
                  <h2 className="display-sm text-[clamp(1.75rem,4vw,2.75rem)]">
                    What a shortlist looks like
                  </h2>
                  <p className="measure mt-4 leading-relaxed text-ink-soft">
                    Reach, engagement and rate card on every influencer.
                    Samples, turnaround and per-video price on every UGC
                    creator.
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
        <section id="how" className="ground-5 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="display-sm reveal text-center text-[clamp(1.75rem,4vw,2.75rem)]">
              Brief in, shortlist out
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

            <div className="reveal mt-14 text-center">
              <Link href="/roster" className="btn btn-accent">
                Start filtering
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
