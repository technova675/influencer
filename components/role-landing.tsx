import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import type { Role } from "@/lib/roles";

/**
 * One role's landing page.
 *
 * Every page rendered through here talks to exactly one kind of person: its own
 * colour, its own hero, its own list of what gets you shortlisted, its own
 * questions. Nothing on the page mentions the other two roles, because somebody
 * who came here to be booked as a model does not need to be sold on content work.
 *
 * The structure is shared so the three pages feel like one company; every word
 * in them comes from lib/roles.ts, so they read as three different pitches.
 */
export function RoleLanding({ role }: { role: Role }) {
  const accent = { "--role": role.accent } as React.CSSProperties;

  return (
    <div style={accent}>
      <SiteNav role={role.id} />

      <main className="flex-1">
        {/* ---------------------------------------------------- hero ----- */}
        <section className={`${role.ground} px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-24`}>
          <div className="mx-auto max-w-4xl text-center">
            <p
              className="overline reveal"
              style={{ color: "var(--role)" }}
            >
              {role.hero.overline}
            </p>
            <h1 className="display reveal mt-5 text-[clamp(2.5rem,7vw,4.5rem)]">
              {role.hero.title[0]}
              <br />
              {role.hero.title[1]}
            </h1>
            <p className="measure reveal mx-auto mt-6 leading-relaxed text-ink-soft sm:text-lg">
              {role.hero.lede}
            </p>

            <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/join?role=${role.id}`}
                className="btn btn-accent w-full sm:w-auto"
                style={{ background: "var(--role)", borderColor: "var(--role)" }}
              >
                {role.hero.cta}
              </Link>
              <Link href="#how" className="btn btn-ghost w-full sm:w-auto">
                How it works
              </Link>
            </div>

            <ul className="reveal mx-auto mt-8 flex max-w-2xl flex-col items-center gap-2 text-sm text-ink-faint sm:flex-row sm:justify-center sm:gap-6">
              {role.hero.assurances.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <Tick />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------- what you're selling ---- */}
        <section className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="overline">What gets you booked</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
                {role.sells}
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {role.shortlistedOn.map((s, i) => (
                <div key={s.label} className="card reveal flex flex-col p-6 sm:p-7">
                  <span
                    className="figure-plain text-2xl"
                    style={{ color: "var(--role)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-sm mt-4 text-xl">{s.label}</h3>
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
          <div className="mx-auto max-w-5xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="overline">Start to booked</p>
              <h2 className="display-sm mt-4 text-[clamp(1.75rem,4vw,2.75rem)]">
                Three steps, and you&rsquo;re on it
              </h2>
            </div>

            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {role.steps.map((s) => (
                <li key={s.n} className="reveal">
                  <span
                    className="figure-plain text-3xl"
                    style={{ color: "var(--role)" }}
                  >
                    {s.n}
                  </span>
                  <h3 className="display-sm mt-4 text-xl">{s.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {s.d}
                  </p>
                </li>
              ))}
            </ol>

            {/* Telling somebody what the form asks for before they open it is
                the single cheapest way to stop half-finished applications. */}
            <div className="card reveal mt-14 p-7 sm:p-9">
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
        <section id="faq" className="ground-2 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="display-sm reveal text-center text-[clamp(1.75rem,4vw,2.75rem)]">
              Straight answers
            </h2>
            <div className="mt-11 space-y-3">
              {role.faqs.map((f) => (
                <details key={f.q} className="card reveal group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-medium">{f.q}</span>
                    <span className="shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3.5 text-sm leading-relaxed text-ink-soft">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ close --- */}
        <section className={`${role.ground} px-5 py-24 sm:px-8 sm:py-32`}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display reveal text-[clamp(2rem,5.5vw,3.25rem)]">
              {role.hero.title[0]}
              <br />
              {role.hero.title[1]}
            </h2>
            <div className="reveal mt-9">
              <Link
                href={`/join?role=${role.id}`}
                className="btn btn-accent"
                style={{ background: "var(--role)", borderColor: "var(--role)" }}
              >
                {role.hero.cta}
              </Link>
            </div>
            <p className="reveal mt-5 text-xs text-ink-faint">
              {role.hero.assurances.join(" · ")}
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
