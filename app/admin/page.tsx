import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAuthed } from "@/lib/auth";
import { fetchCreators, fetchStats, type CreatorRow } from "@/lib/queries";
import {
  compactNumber,
  experienceLabel,
  formatHeight,
  formatRupees,
  isModel,
  sellsReach,
  STATUSES,
  talentType,
  tierLabel,
} from "@/lib/taxonomy";
import { publicMediaUrl } from "@/lib/media";
import { LoginForm } from "./login-form";
import { RosterFilters } from "@/components/roster-filters";
import { logout, markVerified, saveNote, setStatus } from "./actions";
import type { Status, TalentType } from "@/lib/taxonomy";

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
  const model = isModel(creator.talent_type) ? creator.model_profile : null;

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

        <span
          className={`badge-talent badge-talent--${creator.talent_type} hidden shrink-0 sm:inline-flex`}
        >
          {talentType(creator.talent_type).label}
        </span>

        {sellsReach(creator.talent_type) ? (
          <div className="hidden text-right sm:block">
            <div className="tabular text-sm font-medium">
              {compactNumber(creator.effective_followers)}
            </div>
            <div className="text-xs text-ink-faint">
              {tierLabel(creator.effective_followers)}
            </div>
          </div>
        ) : model ? (
          <div className="hidden text-right sm:block">
            <div className="tabular text-sm font-medium">
              {formatRupees(model.rate_full_day) ?? "—"}
            </div>
            <div className="text-xs text-ink-faint">
              {formatHeight(model.height_cm) ?? "full day"}
            </div>
          </div>
        ) : (
          <div className="hidden text-right sm:block">
            <div className="tabular text-sm font-medium">
              {formatRupees(creator.rate_video) ?? "—"}
            </div>
            <div className="text-xs text-ink-faint">per video</div>
          </div>
        )}

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
              <div className="overline">
                {sellsReach(creator.talent_type)
                  ? "Reach"
                  : model
                    ? "Casting"
                    : "Delivery"}
              </div>
              <p className="tabular mt-1.5 text-ink-soft">
                {model ? (
                  <>
                    {formatHeight(model.height_cm) ?? "height not given"}
                    {model.bust_cm && model.waist_cm && model.hips_cm
                      ? ` · ${model.bust_cm}-${model.waist_cm}-${model.hips_cm}`
                      : ""}
                    {model.dress_size ? ` · dress ${model.dress_size}` : ""}
                    {model.shoe_size ? ` · shoe ${model.shoe_size}` : ""}
                    {model.hair_colour ? ` · ${model.hair_colour} hair` : ""}
                    {model.eye_colour ? ` · ${model.eye_colour} eyes` : ""}
                    {model.visible_tattoos ? " · visible tattoos" : ""}
                    {" · "}
                    {creator.showcase_media_paths.length} digitals
                  </>
                ) : sellsReach(creator.talent_type) ? (
                  <>
                    {compactNumber(creator.effective_followers)} followers ·{" "}
                    {creator.effective_engagement_rate ?? "—"}% engagement ·{" "}
                    {compactNumber(creator.avg_reel_views)} avg views
                  </>
                ) : (
                  <>
                    {creator.turnaround_days
                      ? `${creator.turnaround_days}-day turnaround`
                      : "turnaround not given"}{" "}
                    · {creator.showcase_media_paths.length} samples
                  </>
                )}
                {creator.is_verified && (
                  <span className="pill pill-accent ml-2 !text-xs">verified</span>
                )}
              </p>
            </div>

            {/* A model already signed elsewhere is the one thing you have to
                know before pitching them, so it is called out rather than
                buried in the measurements line. */}
            {model && (
              <div>
                <div className="overline">Cast for</div>
                <p className="mt-1.5 text-ink-soft">
                  {model.model_categories.length > 0
                    ? model.model_categories.join(", ")
                    : "not given"}
                  {experienceLabel(model.experience_level)
                    ? ` · ${experienceLabel(model.experience_level)}`
                    : ""}
                  {model.travel_willing ? " · will travel" : ""}
                </p>
                {model.agency_signed && (
                  <p className="mt-1.5 text-[#8a5a00]">
                    Signed to {model.agency_name || "an agency"} — check
                    exclusivity before pitching.
                  </p>
                )}
                {model.buyout_terms && (
                  <p className="mt-1.5 leading-relaxed text-ink-soft">
                    {model.buyout_terms}
                  </p>
                )}
              </div>
            )}

            <div>
              <div className="overline">Rates</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ["Reel", creator.rate_reel],
                  ["Story", creator.rate_story],
                  ["Post", creator.rate_static_post],
                  ["YT", creator.rate_youtube_integration],
                  ["Content", creator.rate_video],
                  ["Half day", model?.rate_half_day ?? null],
                  ["Full day", model?.rate_full_day ?? null],
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
  const positiveInt = (v: string | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const page = Number(one("page"));
  const status = one("status");

  const { creators, total } = await fetchCreators(
    {
      q: one("q"),
      genre: one("genre"),
      city: one("city"),
      language: one("language"),
      talent: one("talent") as TalentType | undefined,
      tier: one("tier") as never,
      modelCategory: one("modelCategory"),
      minHeight: positiveInt(one("minHeight")),
      maxDayRate: positiveInt(one("maxDayRate")),
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
        Nobody matches. Submissions land here the moment someone completes the
        form at <Link href="/join" className="underline">/join</Link>.
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
    influencers: 0,
    creators: 0,
    models: 0,
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
              Roster view
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost !py-2 !text-sm">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile figure={stats.total} label="total profiles" />
          <StatTile figure={stats.pending} label="awaiting review" />
          <StatTile figure={stats.approved} label="live on roster" />
          <StatTile figure={stats.models} label="models" />
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
