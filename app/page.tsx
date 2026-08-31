import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { chooseRole } from "@/app/actions/role";
import { fetchStats } from "@/lib/queries";
import { ROLE_COOKIE, ROLE_LIST, roleById } from "@/lib/roles";
import { compactNumber } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Callsheet — influencers, creators and models",
  description:
    "Tell us which one you are. Influencers, creators and models each get their own application; brands get a shortlist filtered against the brief.",
};

/**
 * Onboarding. The only page everybody sees, and it exists to ask one question.
 *
 * Everything downstream is scoped to the answer: a model never reads about
 * follower tiers, an influencer is never asked for measurements, and no one on
 * the roster is ever shown anyone else. Splitting here rather than filtering
 * later is what makes that a property of the site's shape rather than a setting
 * somebody could get wrong.
 */

function Door({
  role,
  eyebrow,
  title,
  line,
  accent,
}: {
  role: string;
  eyebrow: string;
  title: string;
  line: string;
  accent: string;
}) {
  return (
    <button
      type="submit"
      name="role"
      value={role}
      className="door reveal w-full cursor-pointer text-left"
      style={{ "--door-accent": accent } as React.CSSProperties}
    >
      <p className="overline">{eyebrow}</p>
      <h2 className="display-sm mt-3 text-[clamp(1.35rem,2.6vw,1.75rem)]">
        {title}
      </h2>
      <p className="measure mt-3 text-sm leading-relaxed text-ink-soft">{line}</p>
      <span
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
        style={{ color: accent }}
      >
        Continue
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 8h11m-4.5-4.5L13 8l-4.5 4.5"
          />
        </svg>
      </span>
    </button>
  );
}

const DOOR_COPY: Record<string, { eyebrow: string; title: string; line: string }> = {
  influencer: {
    eyebrow: "I post on my own channel",
    title: "Influencer",
    line: "Brands pay to reach the audience you've already built. You post it, in your voice, for a rate you set.",
  },
  creator: {
    eyebrow: "I shoot, the brand posts",
    title: "Creator",
    line: "You make the footage and hand it over — the brand runs it as their own ad. No audience needed.",
  },
  model: {
    eyebrow: "I get booked for shoots",
    title: "Model",
    line: "Campaigns, catalogue, runway, print. Paid for the day and the usage, not for a post.",
  },
};

export default async function OnboardingPage() {
  const [jar, stats] = await Promise.all([
    cookies(),
    fetchStats().catch(() => ({
      total: 0,
      approved: 0,
      pending: 0,
      cities: 0,
      influencers: 0,
      creators: 0,
      models: 0,
    })),
  ]);

  const rememberedRole = roleById(jar.get(ROLE_COOKIE)?.value);

  return (
    <>
      <SiteNav variant="bare" />

      <main className="ground-2 flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <header className="mx-auto max-w-2xl text-center">
            <p className="overline reveal">Callsheet</p>
            <h1 className="display reveal mt-5 text-[clamp(2.25rem,6vw,4rem)]">
              First — which
              <br />
              one are you?
            </h1>
            <p className="measure reveal mx-auto mt-6 leading-relaxed text-ink-soft sm:text-lg">
              The three do genuinely different work and get hired on completely
              different things, so each has its own page and its own
              application. Pick yours and you&rsquo;ll never be shown the other
              two again.
            </p>
          </header>

          {/* A returning visitor is offered their own page rather than being
              made to answer the same question twice - but never forced back
              into it, in case they chose wrong the first time. */}
          {rememberedRole && (
            <form
              action={chooseRole}
              className="reveal mx-auto mt-9 flex max-w-md justify-center"
            >
              <input type="hidden" name="role" value={rememberedRole.id} />
              <button type="submit" className="btn btn-primary">
                Continue as {rememberedRole.label.toLowerCase()}
              </button>
            </form>
          )}

          <form action={chooseRole} className="mt-12 grid gap-5 md:grid-cols-3">
            {ROLE_LIST.map((r) => (
              <Door
                key={r.id}
                role={r.id}
                accent={r.accent}
                eyebrow={DOOR_COPY[r.id].eyebrow}
                title={DOOR_COPY[r.id].title}
                line={DOOR_COPY[r.id].line}
              />
            ))}
          </form>

          {/* The brand door is separated because a brand is not applying to
              anything - it is the other side of the marketplace. */}
          <form action={chooseRole} className="mt-5">
            <button
              type="submit"
              name="role"
              value="brand"
              className="card reveal flex w-full cursor-pointer flex-wrap items-center justify-between gap-5 p-6 text-left transition-shadow duration-300 hover:shadow-[var(--shadow-md)] sm:p-7"
            >
              <div>
                <p className="overline">I&rsquo;m hiring</p>
                <h2 className="display-sm mt-2 text-xl">
                  Brand, agency or casting
                </h2>
                <p className="measure mt-2 text-sm leading-relaxed text-ink-soft">
                  Send the brief. We filter the roster against it and come back
                  with a shortlist — names, rates and availability included.
                </p>
              </div>
              <span className="text-sm font-medium text-accent">
                Continue &rarr;
              </span>
            </button>
          </form>

          <div className="reveal mt-16 grid grid-cols-3 gap-6 border-t border-line/70 pt-10 text-center">
            <div>
              <div className="stat-figure tabular text-3xl sm:text-4xl">
                {stats.approved > 0 ? compactNumber(stats.approved) : "—"}
              </div>
              <div className="mt-2 text-sm text-ink-soft">on the roster</div>
            </div>
            <div>
              <div className="stat-figure tabular text-3xl sm:text-4xl">
                {stats.cities > 0 ? stats.cities : "—"}
              </div>
              <div className="mt-2 text-sm text-ink-soft">cities covered</div>
            </div>
            <div>
              <div className="stat-figure text-3xl sm:text-4xl">Free</div>
              <div className="mt-2 text-sm text-ink-soft">to apply, always</div>
            </div>
          </div>

          <p className="measure reveal mx-auto mt-10 text-center text-sm leading-relaxed text-ink-faint">
            Whichever you pick: applying is free, there is no login for talent,
            and nobody on the roster can see anyone else&rsquo;s profile, rates
            or contact details.
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
