import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import type { Role } from "@/lib/roles";

/**
 * One role's landing page.
 *
 * Every page rendered through here talks to exactly one kind of person: its own
 * colour, its own hero, its own ticker of going rates, its own list of what
 * gets you shortlisted, its own questions. Nothing on the page mentions the
 * other two roles, because somebody who came here to be booked as a model does
 * not need to be sold on content work.
 *
 * The structure is shared so the three pages feel like one company; every word
 * and every figure in them comes from lib/roles.ts, so they read as three
 * different pitches quoted in three different units - per placement, per video,
 * per day.
 */
export function RoleLanding({ role }: { role: Role }) {
  const accent = { "--role": role.accent } as React.CSSProperties;
  const roleBtn = {
    background: "var(--role)",
    borderColor: "var(--role)",
  } as React.CSSProperties;

  return (
    <div style={accent}>
      <SiteNav role={role.id} />

      <main className="flex-1">
        {/* ---------------------------------------------------- hero ----- */}
        <section className={role.ground}>
          <div className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
            <p
              className="overline reveal flex items-center gap-2.5"
              style={{ color: "var(--role)" }}
            >
              <span
                className="inline-block h-[7px] w-[7px] shrink-0"
                style={{ background: "var(--role)" }}
                aria-hidden
              />
              {role.hero.overline}
            </p>

            <h1 className="display reveal mt-6 max-w-4xl text-[clamp(2.5rem,7vw,4.5rem)]">
              {role.hero.title[0]}
              <br />
              {role.hero.title[1]}
            </h1>

            <p className="measure reveal mt-6 leading-relaxed text-ink-soft sm:text-lg">
              {role.hero.lede}
            </p>

            <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/join?role=${role.id}`}
                className="btn btn-accent w-full sm:w-auto"
                style={roleBtn}
              >
                {role.hero.cta} &rarr;
              </Link>
              <Link href="#how" className="btn btn-ghost w-full sm:w-auto">
                How it works
              </Link>
            </div>

            <ul className="reveal mt-8 flex flex-col gap-2 text-sm text-ink-faint sm:flex-row sm:gap-7">
              {role.hero.assurances.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <Tick />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* What this role currently goes for, in this role's own units. The
              numbers land before the argument does. */}
          <div className="reveal">
            <Ticker
              items={role.ticker}
              label={`Indicative ${role.label.toLowerCase()} rates by category`}
            />
          </div>
        </section>

        {/* ------------------------------------------- the line item ----- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="reveal">
              <p className="overline">What gets you booked</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
                {role.sells}
              </h2>
            </div>

            {/* The same four rows on all three role pages. A brand reads this
                as a line item; the person reading it sees exactly what they
                are being bought for, with nothing implied. */}
            <div className="card reveal p-6 sm:p-8">
              <p
                className="overline mb-5"
                style={{ color: "var(--role)" }}
              >
                The line item &mdash; {role.label}
              </p>
              <dl>
                {role.lineItem.map((r) => (
                  <div key={r.k} className="spec-row">
                    <dt>{r.k}</dt>
                    <dd>{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* -------------------------------------- what you're selling ---- */}
        <section className="ground-1 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-2xl">
              <p className="overline">Scored on three things</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
                What a shortlist is actually decided on
              </h2>
            </div>

            <div className="ledger reveal mt-11 md:grid-cols-3">
              {role.shortlistedOn.map((s, i) => (
                <div key={s.label} className="flex flex-col p-7 sm:p-8">
                  <span
                    className="figure-plain text-xs"
                    style={{ color: "var(--role)" }}
                  >
                    {String(i + 1).padStart(2, "0")} / {role.label}
                  </span>
                  <h3 className="display-sm mt-4 text-lg">{s.label}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ how it works -- */}
        <section id="how" className="ground-5 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-2xl">
              <p className="overline">Start to booked</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
                Three steps, and you&rsquo;re on it
              </h2>
            </div>

            <ol className="ledger reveal mt-11 md:grid-cols-3">
              {role.steps.map((s) => (
                <li key={s.n} className="p-7 sm:p-8">
                  <span
                    className="figure-plain text-xs"
                    style={{ color: "var(--role)" }}
                  >
                    Step {s.n}
                  </span>
                  <h3 className="display-sm mt-4 text-lg">{s.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {s.d}
                  </p>
                </li>
              ))}
            </ol>

            {/* Telling somebody what the form asks for before they open it is
                the single cheapest way to stop half-finished applications. */}
            <div className="card reveal mt-8 p-7 sm:p-9">
              <p className="overline">Before you start</p>
              <h3 className="display-sm mt-3 text-xl">
                Have these to hand and it takes about five minutes
              </h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {role.asked.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
                  >
                    <span className="mt-1.5 shrink-0">
                      <Tick />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- faq --- */}
        <section id="faq" className="ground-1 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="overline reveal">Questions</p>
            <h2 className="display-sm reveal mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
              Straight answers
            </h2>
            <div className="ledger reveal mt-10">
              {role.faqs.map((f) => (
                <details key={f.q} className="group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-medium">{f.q}</span>
                    <span className="mono shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="measure mt-3.5 text-sm leading-relaxed text-ink-soft">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ close --- */}
        <section className="ground-ink px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="overline reveal" style={{ color: "#a6a8a0" }}>
              {role.plural}
            </p>
            <h2 className="display reveal mt-5 max-w-3xl text-[clamp(2rem,5.5vw,3.25rem)]">
              {role.hero.title[0]} {role.hero.title[1]}
            </h2>
            <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/join?role=${role.id}`}
                className="btn btn-primary w-full sm:w-auto"
              >
                {role.hero.cta} &rarr;
              </Link>
              {/* Was /for-brands; the hiring side is the shortlist bar on the
                  landing page now. */}
              <Link href="/#shortlist" className="btn btn-ghost w-full sm:w-auto">
                I&rsquo;m hiring, not applying
              </Link>
            </div>
            <p className="mono reveal mt-6 text-xs" style={{ color: "#a6a8a0" }}>
              {role.hero.assurances.join("  ·  ")}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter role={role.id} />
    </div>
  );
}

function Tick() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      style={{ color: "var(--role)" }}
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.5L6.5 12L13 4.5"
      />
    </svg>
  );
}
