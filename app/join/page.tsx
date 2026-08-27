import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { CreatorForm } from "./creator-form";

export const metadata: Metadata = {
  title: "Join the roster",
  description:
    "Add yourself to the roster in five short steps. Free, you set your own rates, and your contact details stay private.",
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
              Five short steps, and only three fields are compulsory. It is
              free, you set your own rates, and your phone and email are never
              shown publicly.
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
