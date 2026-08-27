import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-[color-mix(in_srgb,var(--ground-1)_85%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="display-sm text-lg tracking-tight">
          Creator Roster
        </Link>

        {/* Both doors, always. Which side of the marketplace someone is on is
            the first thing they need to be able to answer, and the nav is
            where they look for it. */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/for-brands"
            className="hidden rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:inline-flex"
          >
            For brands
          </Link>
          <Link
            href="/roster"
            className="rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Roster
          </Link>
          <Link href="/for-creators" className="btn btn-primary !px-4 !py-2 !text-sm">
            For creators
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="ground-5 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <div className="display-sm text-lg">Creator Roster</div>
          <p className="measure mt-2.5 text-sm leading-relaxed text-ink-soft">
            Two kinds of talent, kept apart on purpose. Influencers post to
            their own audience. UGC creators shoot content brands run as their
            own ads.
          </p>
        </div>
        <div>
          <div className="overline">For creators</div>
          <ul className="mt-3.5 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/for-creators" className="hover:text-ink">
                How it works for you
              </Link>
            </li>
            <li>
              <Link href="/join" className="hover:text-ink">
                Add yourself — free
              </Link>
            </li>
            <li>
              <Link href="/roster?talent=ugc_creator" className="hover:text-ink">
                UGC creators
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="overline">For brands</div>
          <ul className="mt-3.5 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/for-brands" className="hover:text-ink">
                Why this roster
              </Link>
            </li>
            <li>
              <Link href="/roster" className="hover:text-ink">
                Browse the roster
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-ink">
                Agency login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-line px-5 py-6 text-xs text-ink-faint sm:px-8">
        © {new Date().getFullYear()} Creator Roster
      </div>
    </footer>
  );
}
