import Link from "next/link";

/**
 * The two-door choice. Every visitor is on one of two sides of this
 * marketplace, and until they say which, nothing else on the page can be
 * written for them. So this is the first thing under the hero.
 */
export function TwoDoor() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Link
        href="/for-creators"
        className="door reveal"
        style={{ "--door-accent": "var(--influencer)" } as React.CSSProperties}
      >
        <p className="overline">I make the content</p>
        <h3 className="display-sm mt-3 text-[clamp(1.5rem,3vw,2rem)]">
          Creators &amp; influencers
        </h3>
        <p className="measure mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
          List yourself free, set your own rates, and get found by brands
          filtering for exactly what you make. Five short questions.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
          Add yourself to the roster
          <Arrow />
        </span>
      </Link>

      <Link
        href="/for-brands"
        className="door reveal"
        style={{ "--door-accent": "var(--ugc)" } as React.CSSProperties}
      >
        <p className="overline">I&rsquo;m hiring</p>
        <h3 className="display-sm mt-3 text-[clamp(1.5rem,3vw,2rem)]">
          Brands &amp; agencies
        </h3>
        <p className="measure mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
          Filter a reviewed roster by genre, tier, city, language and budget —
          with rates already on every card. Shortlist the same day.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--ugc)]">
          Browse the roster
          <Arrow />
        </span>
      </Link>
    </div>
  );
}

function Arrow() {
  return (
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
  );
}

/**
 * Influencer vs UGC creator, side by side. This is the distinction the roster,
 * the cards and the join form all turn on, so it gets stated once, plainly,
 * rather than being left for a visitor to infer from the listings.
 */
export function TalentExplainer({
  counts,
}: {
  counts?: { influencers: number; ugc: number };
}) {
  const columns = [
    {
      key: "influencer" as const,
      label: "Influencer",
      line: "Sells access to their audience",
      href: "/roster?talent=influencer",
      count: counts?.influencers,
      rows: [
        ["Who posts it", "They do, on their own channel"],
        ["What you're buying", "Reach, engagement, trust"],
        ["Priced by", "Placement — per reel, story, post"],
        ["Shortlist on", "Followers, engagement rate, audience city"],
      ],
    },
    {
      key: "ugc_creator" as const,
      label: "UGC creator",
      line: "Sells the footage, not an audience",
      href: "/roster?talent=ugc_creator",
      count: counts?.ugc,
      rows: [
        ["Who posts it", "You do, as your own ad"],
        ["What you're buying", "The content itself, with usage rights"],
        ["Priced by", "Deliverable — per video, per turnaround"],
        ["Shortlist on", "Craft, formats, samples, speed"],
      ],
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {columns.map((c) => (
        <div key={c.key} className="card reveal flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className={`badge-talent badge-talent--${c.key}`}>
              {c.label}
            </span>
            {c.count != null && c.count > 0 && (
              <span className="tabular text-sm text-ink-faint">
                {c.count} on the roster
              </span>
            )}
          </div>

          <h3 className="display-sm mt-4 text-xl sm:text-2xl">{c.line}</h3>

          <dl className="mt-6 space-y-3.5 border-t border-line pt-5 text-sm">
            {c.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>

          <Link
            href={c.href}
            className="btn btn-ghost mt-7 self-start !py-2 !text-sm"
          >
            See {c.label.toLowerCase()}s
          </Link>
        </div>
      ))}
    </div>
  );
}
