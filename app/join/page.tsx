import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorForm } from "./creator-form";

export const metadata: Metadata = {
  title: "Join the roster",
  description:
    "Add yourself to the roster. Brands filter by genre, tier, city and budget — a complete profile puts you in more shortlists.",
};

export default function JoinPage() {
  return (
    <>
      <SiteNav />

      <main className="ground-2 flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <header className="text-center">
            <p className="overline">For creators</p>
            <h1 className="display mt-4 text-[clamp(2.25rem,6vw,3.5rem)]">
              Add yourself
              <br />
              to the roster.
            </h1>
            <p className="measure mx-auto mt-5 leading-relaxed text-ink-soft">
              Four short sections. Brands filter this roster by genre, tier,
              city, language and budget — the more of it you fill in, the more
              briefs you turn up in.
            </p>
          </header>

          <div className="mt-12">
            <CreatorForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
