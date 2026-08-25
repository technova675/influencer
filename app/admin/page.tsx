import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAuthed } from "@/lib/auth";
import { fetchCreators, fetchStats, type CreatorRow } from "@/lib/queries";
import { compactNumber, formatRupees, STATUSES, tierLabel } from "@/lib/taxonomy";
import { publicMediaUrl } from "@/lib/media";
import { LoginForm } from "./login-form";
import { RosterFilters } from "@/components/roster-filters";
import { logout, markVerified, saveNote, setStatus } from "./actions";
import type { Status } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Roster admin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-[#fff4e0] text-[#8a5a00]",
  approved: "bg-[#e6f5ec] text-[#1d6b3f]",
  featured: "bg-accent-soft text-accent",
  rejected: "bg-[#fdecea] text-[#8c2018]",
  archived: "bg-black/5 text-ink-faint",
};

function StatTile({ figure, label }: { figure: number | string; label: string }) {
  return (
    <div className="card p-5">
      <div className="stat-figure tabular text-3xl">{figure}</div>
      <div className="mt-1.5 text-sm text-ink-soft">{label}</div>
    </div>
  );
}

function AdminRow({ creator }: { creator: CreatorRow }) {
  const photo = publicMediaUrl(creator.profile_photo_path);
  const handle =
    creator.instagram_handle ?? creator.youtube_handle ?? creator.x_handle;

  return (
    <details className="card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3.5 p-4 transition-colors hover:bg-black/[0.02]">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-black/5">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="display-sm text-sm text-ink-soft">
              {creator.full_name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{creator.full_name}</div>
          <div className="truncate text-sm text-ink-faint">
            {handle ? `@${handle} · ` : ""}
            {creator.primary_genre}
            {creator.city ? ` · ${creator.city}` : ""}
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <div className="tabular text-sm font-medium">
            {compactNumber(creator.effective_followers)}
          </div>
          <div className="text-xs text-ink-faint">
            {tierLabel(creator.effective_followers)}
          </div>
        </div>

        <span
          className={`pill shrink-0 !text-xs ${STATUS_STYLES[creator.status]}`}
        >
          {creator.status}
        </span>
      </summary>

      <div className="border-t border-line bg-black/[0.015] p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div>
              <div className="overline">Contact</div>
              <p className="mt-1.5">
                <a href={`mailto:${creator.email}`} className="hover:underline">
                  {creator.email}
                </a>
                {creator.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${creator.phone}`} className="hover:underline">
                      {creator.phone}
                    </a>
                  </>
                )}
              </p>
            </div>

            {creator.bio && (
              <div>
                <div className="overline">Bio</div>
                <p className="mt-1.5 leading-relaxed text-ink-soft">
                  {creator.bio}
                </p>
              </div>
            )}

            <div>
              <div className="overline">Reach</div>
              <p className="tabular mt-1.5 text-ink-soft">
                {compactNumber(creator.effective_followers)} followers ·{" "}
                {creator.effective_engagement_rate ?? "—"}% engagement ·{" "}
                {compactNumber(creator.avg_reel_views)} avg views
                {creator.is_verified && (
                  <span className="pill pill-accent ml-2 !text-xs">verified</span>
                )}
              </p>
            </div>

            <div>
              <div className="overline">Rates</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ["Reel", creator.rate_reel],
                  ["Story", creator.rate_story],
                  ["Post", creator.rate_static_post],
                  ["YT", creator.rate_youtube_integration],
                  ["UGC", creator.rate_ugc_video],
                ]
                  .filter(([, v]) => v != null)
                  .map(([l, v]) => (
                    <span key={String(l)} className="pill tabular !text-xs">
                      {l} {formatRupees(v as number)}
                    </span>
                  ))}
                {creator.barter_open && (
                  <span className="pill !text-xs">barter ok</span>
                )}
              </div>
            </div>

            {creator.past_brands.length > 0 && (
              <div>
                <div className="overline">Past brands</div>
                <p className="mt-1.5 text-ink-soft">
                  {creator.past_brands.join(", ")}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="overline mb-2">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <form key={s} action={setStatus}>
                    <input type="hidden" name="id" value={creator.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={s === creator.status}
                      className={`chip !text-xs ${
                        s === creator.status
                          ? "!bg-ink !text-white !border-ink cursor-default"
                          : ""
                      }`}
                    >
                      {s}
                    </button>
                  </form>
                ))}
              </div>
            </div>

            {!creator.is_verified && (
              <form action={markVerified}>
                <input type="hidden" name="id" value={creator.id} />
                <button type="submit" className="btn btn-ghost !py-2 !text-sm">
                  Mark figures verified
                </button>
              </form>
            )}

            <form action={saveNote}>
              <input type="hidden" name="id" value={creator.id} />
              <label htmlFor={`note-${creator.id}`} className="overline mb-2 block">
                Internal note
              </label>
              <textarea
                id={`note-${creator.id}`}
                name="internal_notes"
                rows={3}
                defaultValue={creator.internal_notes ?? ""}
                className="field resize-y !text-sm"
                placeholder="Reliable, quick turnaround. Asked for 20% more in Nov."
              />
              <button type="submit" className="btn btn-ghost mt-2 !py-2 !text-sm">
                Save note
              </button>
            </form>
          </div>
        </div>
      </div>
    </details>
  );
}

async function AdminList({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Number(one("page"));
  const status = one("status");

  const { creators, total } = await fetchCreators(
    {
      q: one("q"),
      genre: one("genre"),
      city: one("city"),
      language: one("language"),
      tier: one("tier") as never,
      status: (status as Status) ?? "all",
      sort: "recent",
      page: Number.isFinite(page) && page > 0 ? page : 1,
      perPage: 50,
    },
    { includePrivate: true },
  );

  if (creators.length === 0) {
    return (
      <p className="py-20 text-center text-ink-soft">
        No creators match. Submissions land here the moment someone completes
        the form at <Link href="/join" className="underline">/join</Link>.
      </p>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm text-ink-faint">
        <span className="tabular font-medium text-ink">{total}</span> total
      </p>
      <div className="mt-4 space-y-2.5">
        {creators.map((c) => (
          <AdminRow key={c.id} creator={c} />
        ))}
      </div>
    </>
  );
}

export default async function AdminPage(props: PageProps<"/admin">) {
  if (!(await isAuthed())) {
    return (
      <main className="ground-1 grid min-h-screen place-items-center px-5">
        <LoginForm />
      </main>
    );
  }

  const sp = await props.searchParams;
  const stats = await fetchStats().catch(() => ({
    total: 0,
    approved: 0,
    pending: 0,
    cities: 0,
  }));

  const exportQs = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) =>
      v ? [[k, Array.isArray(v) ? v[0] : v] as [string, string]] : [],
    ),
  );

  return (
    <main className="ground-2 min-h-screen px-5 pb-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <p className="overline">Internal</p>
            <h1 className="display-sm mt-3 text-3xl">Roster admin</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/admin/export?${exportQs}`}
              prefetch={false}
              className="btn btn-ghost !py-2 !text-sm"
            >
              Export CSV
            </Link>
            <Link href="/roster" className="btn btn-ghost !py-2 !text-sm">
              Public view
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost !py-2 !text-sm">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile figure={stats.total} label="total profiles" />
          <StatTile figure={stats.pending} label="awaiting review" />
          <StatTile figure={stats.approved} label="live on roster" />
          <StatTile figure={stats.cities} label="cities" />
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <RosterFilters basePath="/admin" />
          </Suspense>
        </div>

        <Suspense
          key={JSON.stringify(sp)}
          fallback={
            <div className="mt-6 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card h-[74px] animate-pulse bg-black/[0.03]" />
              ))}
            </div>
          }
        >
          <AdminList sp={sp} />
        </Suspense>
      </div>
    </main>
  );
}
