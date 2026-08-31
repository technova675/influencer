import Link from "next/link";
import { clearRole } from "@/app/actions/role";
import { ROLE_LIST, roleById, type RoleId } from "@/lib/roles";

/**
 * The navigation is scoped to whoever is reading it.
 *
 * A model has no reason to be offered a page about follower tiers, and an
 * influencer has no reason to be offered one about measurements - so a role
 * page's nav carries that role's links and nothing else. The role comes in as a
 * prop from the page itself rather than from a cookie, which keeps every
 * landing page statically rendered.
 *
 * `variant="bare"` is the onboarding screen: no links at all, because the
 * whole page is the choice.
 */
export function SiteNav({
  role,
  variant,
}: {
  role?: RoleId | "brand";
  variant?: "bare";
} = {}) {
  const talent = roleById(role ?? null);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-[color-mix(in_srgb,var(--ground-1)_85%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="display-sm text-lg tracking-tight">
          Callsheet
        </Link>

        {variant === "bare" ? null : talent ? (
          <div className="flex items-center gap-1 sm:gap-3">
            <span className="hidden text-sm text-ink-faint sm:inline">
              {talent.plural}
            </span>
            <form action={clearRole}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                Not a{talent.id === "influencer" ? "n" : ""}{" "}
                {talent.label.toLowerCase()}?
              </button>
            </form>
            <Link
              href={`/join?role=${talent.id}`}
              className="btn btn-primary !px-4 !py-2 !text-sm"
            >
              Apply
            </Link>
          </div>
        ) : (
          /* The brand nav is the one place all three are named, because a
             brand hires across all of them. */
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/for-brands#how"
              className="hidden rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:inline-flex"
            >
              How it works
            </Link>
            <form action={clearRole}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                I&rsquo;m talent
              </button>
            </form>
            <Link href="/for-brands#brief" className="btn btn-primary !px-4 !py-2 !text-sm">
              Send a brief
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter({ role }: { role?: RoleId | "brand" } = {}) {
  const talent = roleById(role ?? null);

  return (
    <footer className="ground-5 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <div className="display-sm text-lg">Callsheet</div>
          <p className="measure mt-2.5 text-sm leading-relaxed text-ink-soft">
            {talent
              ? talent.sells
              : "A call sheet is the list a production sends the night before a shoot — who's booked, when, and for how much. Same idea: influencers, creators and models, filtered against your brief."}
          </p>
        </div>

        <div>
          <div className="overline">{talent ? talent.plural : "Hiring"}</div>
          <ul className="mt-3.5 space-y-2 text-sm text-ink-soft">
            {talent ? (
              <>
                <li>
                  <Link href={talent.slug} className="hover:text-ink">
                    How it works for you
                  </Link>
                </li>
                <li>
                  <Link href={`/join?role=${talent.id}`} className="hover:text-ink">
                    Apply — free
                  </Link>
                </li>
                <li>
                  <Link href={`${talent.slug}#faq`} className="hover:text-ink">
                    Questions
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/for-brands" className="hover:text-ink">
                    Why this roster
                  </Link>
                </li>
                <li>
                  <Link href="/for-brands#how" className="hover:text-ink">
                    Brief in, shortlist out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <div className="overline">Privacy</div>
          <ul className="mt-3.5 space-y-2 text-sm text-ink-soft">
            <li>
              Nobody on the roster can see anyone else&rsquo;s profile, rates or
              contact details.
            </li>
            <li>
              <Link href="/roster" className="hover:text-ink">
                Agency sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-6 text-xs text-ink-faint sm:px-8">
        <span>© {new Date().getFullYear()} Callsheet</span>
        {!talent && (
          <span className="hidden sm:inline">
            {ROLE_LIST.map((r) => r.plural).join(" · ")}
          </span>
        )}
      </div>
    </footer>
  );
}
