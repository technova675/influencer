import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        {/* The same mark the landing page uses, at the same size, so the brand
            does not change shape between the front door and the rest of the
            site. `alt` is empty on purpose: the wordmark sits immediately
            beside it, so describing the image too would make a screen reader
            announce the brand twice. */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={26}
            height={26}
            priority
            className="h-[26px] w-[26px] shrink-0"
            style={{ borderRadius: "var(--radius)" }}
          />
          <span>
            <span className="display-sm block text-[15px] leading-none">
              Adbibe
            </span>
            <span className="overline block text-[9px] leading-none mt-1">
              {talent ? talent.plural : "Creator Network"}
            </span>
          </span>
        </Link>

        {variant === "bare" ? null : talent ? (
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href={`${talent.slug}#how`}
              className="mono hidden px-3 py-2 text-xs text-ink-faint transition-colors hover:text-ink sm:inline-flex"
            >
              How it works
            </Link>
            <form action={clearRole}>
              <button
                type="submit"
                className="mono px-3 py-2 text-xs text-ink-faint transition-colors hover:text-ink"
              >
                Not a{talent.id === "influencer" ? "n" : ""}{" "}
                {talent.label.toLowerCase()}?
              </button>
            </form>
            <Link
              href={`/join?role=${talent.id}`}
              className="btn btn-primary !px-4 !py-2 !text-xs"
            >
              Apply
            </Link>
          </div>
        ) : (
          /* No role chosen. The brand nav that used to live here pointed at
             /for-brands and its brief form; with the hiring side reduced to
             the shortlist bar on the landing page, both links now go there
             instead. The originals are kept commented below. */
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/#scoring"
              className="mono hidden px-3 py-2 text-xs text-ink-faint transition-colors hover:text-ink sm:inline-flex"
            >
              How it works
            </Link>
            <form action={clearRole}>
              <button
                type="submit"
                className="mono px-3 py-2 text-xs text-ink-faint transition-colors hover:text-ink"
              >
                I&rsquo;m talent
              </button>
            </form>
            <Link href="/#shortlist" className="btn btn-primary !px-4 !py-2 !text-xs">
              Get a shortlist
            </Link>
            {/*
            <Link href="/for-brands#how">How it works</Link>
            <Link href="/for-brands#brief" className="btn btn-primary !px-4 !py-2 !text-xs">
              Send a brief
            </Link>
            */}
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
          <div className="display-sm text-lg">Adbibe</div>
          <p className="measure mt-2.5 text-sm leading-relaxed text-ink-soft">
            {talent
              ? talent.sells
              : "Creator Network is part of Adbibe's influencer marketing line — influencers, creators and models, filtered against what you need."}
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
                  <Link href="/#shortlist" className="hover:text-ink">
                    Get a shortlist
                  </Link>
                </li>
                <li>
                  <Link href="/#scoring" className="hover:text-ink">
                    How the roster is scored
                  </Link>
                </li>
                {/*
                <li><Link href="/for-brands">Why this roster</Link></li>
                <li><Link href="/for-brands#how">Brief in, shortlist out</Link></li>
                */}
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
        <span>© {new Date().getFullYear()} Adbibe</span>
        {!talent && (
          <span className="hidden sm:inline">
            {ROLE_LIST.map((r) => r.plural).join(" · ")}
          </span>
        )}
      </div>
    </footer>
  );
}
