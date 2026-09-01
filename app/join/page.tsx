import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { ROLE_LOCK_DAYS, roleById } from "@/lib/roles";
import { CreatorForm } from "./creator-form";

export const metadata: Metadata = {
  title: "Apply to the roster",
  description:
    "Four short steps. Free, you set your own rates, and your contact details stay private.",
  robots: { index: false, follow: true },
};

/**
 * The application, always scoped to one role.
 *
 * Reaching this page without a role means somebody skipped the choice, so they
 * are sent back to make it - the form's questions, its validation and the
 * record it writes all depend on the answer.
 */
export default async function JoinPage(props: PageProps<"/join">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.role) ? sp.role[0] : sp.role;
  const role = roleById(raw);

  if (!role) redirect("/");

  return (
    <>
      <SiteNav role={role.id} />

      <main
        className="ground-2 flex-1 px-5 py-14 sm:px-8 sm:py-20"
        style={{ "--role": role.accent } as React.CSSProperties}
      >
        <div className="mx-auto max-w-3xl">
          <header>
            {/* The role is named in the label, the dot and the headline. The
                form below asks a different set of questions for each one, so
                being unambiguous about which one is being filled in matters
                more here than anywhere else on the site. */}
            <p
              className="overline flex items-center gap-2.5"
              style={{ color: role.accent }}
            >
              <span
                className="inline-block h-[7px] w-[7px] shrink-0"
                style={{ background: role.accent }}
                aria-hidden
              />
              Applying as a {role.label.toLowerCase()}
            </p>
            <h1 className="display mt-5 text-[clamp(2.25rem,6vw,3.5rem)]">
              Add yourself to the
              <br />
              {role.label.toLowerCase()} roster.
            </h1>
            <p className="measure mt-5 leading-relaxed text-ink-soft">
              Four short steps, and only three fields are compulsory. It is
              free, you set your own rates, and your phone and email are never
              shown publicly.
            </p>
            <p className="measure mt-4 text-xs leading-relaxed text-ink-faint">
              You&rsquo;re applying as a {role.label.toLowerCase()}. You can
              update this profile any time with the same email — but changing to
              a different role is locked for {ROLE_LOCK_DAYS} days, so pick the
              one that fits.
            </p>
          </header>

          <div className="mt-12">
            <CreatorForm role={role} />
          </div>
        </div>
      </main>

      <SiteFooter role={role.id} />
    </>
  );
}
