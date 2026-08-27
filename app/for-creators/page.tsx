import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { TalentExplainer } from "@/components/two-door";
import { fetchStats } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "For creators",
  description:
    "List yourself free, set your own rates, and get found by brands filtering for exactly what you make. Influencers and UGC creators both welcome.",
};

const STEPS = [
  {
    n: "01",
    t: "Say how you work",
    d: "Post to your own audience, shoot content the brand runs as its own ad, or both. It is the first question on the form and it decides everything you are asked after it.",
  },
  {
    n: "02",
    t: "Fill in five short steps",
    d: "Your details, what you make, your numbers or your samples, and your rates. Only your name, email and main genre are required — the rest you can add later.",
  },
  {
    n: "03",
    t: "We review it",
    d: "A talent manager checks the profile before it goes public. Self-reported numbers stay marked as self-reported until we can verify them, so honest figures are always the ones that pay off.",
  },
  {
    n: "04",
    t: "Brands filter, you turn up",
    d: "When a brief matches your genre, city, language and budget, you are in the shortlist with your rate card already attached — no back-and-forth before the first conversation.",
  },
];

const ANSWERS = [
  {
    q: "Does it cost anything?",
    a: "No. Listing yourself is free, and there is no commission taken out of what a brand pays you.",
  },
  {
    q: "Do I need a big following?",
    a: "No. Nano and micro creators get shortlisted constantly because their engagement is better and their rates fit real budgets. And if you are a UGC creator, your follower count is not shown at all — your samples are.",
  },
  {
    q: "Who sets the rates?",
    a: "You do, per deliverable, in rupees. They are shown on your card so brands arrive already knowing your price.",
  },
  {
    q: "Is my phone number public?",
    a: "Never. Your email and phone are visible only to the agency. The public roster shows your work, your numbers and your rates.",
  },
  {
    q: "Can I change my profile later?",
    a: "Yes. Submit the form again with the same email and it updates your existing profile instead of creating a second one.",
  },
  {
    q: "How long does approval take?",
    a: "We review new profiles within two working days.",
  },
];

export default async function ForCreatorsPage() {
  const stats = await fetchStats().catch(() => ({
    total: 0,
    approved: 0,
    pending: 0,
    cities: 0,
    influencers: 0,
    ugc: 0,
  }));

  return (
    <>
      <SiteNav />

      <main className="flex-1">
        {/* ---------------- Hero ---------------- */}
        <section className="ground-1 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="overline reveal">For creators</p>
            <h1 className="display reveal mt-5 text-[clamp(2.5rem,7vw,4.5rem)]">
              Your rates.
              <br />
              Your terms.
            </h1>
            <p className="measure reveal mx-auto mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              Free to list. You set the price on every deliverable. Brands
              filter this roster by genre, city, language and budget — a
              complete profile is what puts you in front of them.
            </p>
            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/join" className="btn btn-accent w-full sm:w-auto">
                Add yourself — free
              </Link>
              <Link href="/roster" className="btn btn-ghost w-full sm:w-auto">
                See who&rsquo;s already on it
              </Link>
            </div>
            <p className="reveal mt-5 text-xs text-ink-faint">
              No commission · No exclusivity · Contact details never shown
              publicly
            </p>
          </div>
        </section>

        {/* ---------------- Which one are you ---------------- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="overline">Pick your side — or both</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
                Which one are you?
              </h2>
              <p className="measure mx-auto mt-4 leading-relaxed text-ink-soft">
                You do not have to choose one forever. Plenty of people on this
                roster do both, and price them separately.
              </p>
            </div>
            <div className="mt-11">
              <TalentExplainer
                counts={{ influencers: stats.influencers, ugc: stats.ugc }}
              />
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className="ground-3 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="display-sm reveal text-center text-[clamp(1.75rem,4vw,2.75rem)]">
              What actually happens
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
          </div>
        </section>

        {/* ---------------- Questions ---------------- */}
        <section className="ground-4 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="display-sm reveal text-[clamp(1.75rem,4vw,2.5rem)]">
              The questions creators actually ask
            </h2>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {ANSWERS.map((a) => (
                <div key={a.q} className="reveal py-6">
                  <dt className="display-sm text-lg sm:text-xl">{a.q}</dt>
                  <dd className="measure mt-2.5 leading-relaxed text-ink-soft">
                    {a.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------- Close ---------------- */}
        <section className="ground-5 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display reveal text-[clamp(2rem,5.5vw,3.5rem)]">
              Five short steps.
            </h2>
            <p className="measure reveal mx-auto mt-5 leading-relaxed text-ink-soft">
              Name, email and your main genre are all you strictly need to
              start. Everything else can wait.
            </p>
            <div className="reveal mt-9">
              <Link href="/join" className="btn btn-accent">
                Add yourself to the roster
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
