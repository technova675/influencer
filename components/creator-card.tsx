import {
  compactNumber,
  experienceLabel,
  formatHeight,
  formatRupees,
  isModel,
  rateBand,
  sellsContent,
  sellsReach,
  showsWork,
  talentType,
  tierLabel,
} from "@/lib/taxonomy";
import { publicMediaUrl } from "@/lib/media";
import type { CreatorRow } from "@/lib/queries";

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="display-sm text-lg text-ink-soft select-none">
      {initials}
    </span>
  );
}

function Avatar({
  creator,
  size = 56,
  anonymous = false,
}: {
  creator: CreatorRow;
  size?: number;
  anonymous?: boolean;
}) {
  // A headshot identifies someone as surely as their name does, so a redacted
  // card gets an empty disc rather than a photo or even initials.
  const url = anonymous ? null : publicMediaUrl(creator.profile_photo_path);
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-black/10"
      style={{ width: size, height: size }}
    >
      {url ? (
        // A plain <img>: the R2 public host is configuration, so it is not a
        // fixed remotePattern that next/image could be given up front.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : anonymous ? null : (
        <Initials name={creator.full_name} />
      )}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="stat-figure text-xl leading-none">{value}</div>
      <div className="overline mt-1.5 truncate">{label}</div>
    </div>
  );
}

function VerifiedMark() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-accent"
      aria-label="Verified figures"
      role="img"
    >
      <path
        fill="currentColor"
        d="M10 1.5l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.9 2.6-2.7-.2L10 18.5l-2.2-1.6-2.7.2-.9-2.6L2 12.9l1-2.5-1-2.5 2.2-1.6.9-2.6 2.7.2L10 1.5z"
      />
      <path fill="#fff" d="M8.9 12.6L6.4 10l1-1 1.5 1.5 3.7-3.7 1 1z" />
    </svg>
  );
}

/**
 * The strip along the top of the card. A creator sells the footage and a
 * model sells the digitals, so for both the first thing on the card is the
 * pictures - they do the job a follower count does for an influencer. Nobody
 * with no samples gets an empty grey box.
 */
function Showcase({ creator }: { creator: CreatorRow }) {
  const shots = creator.showcase_media_paths
    .map(publicMediaUrl)
    .filter((u): u is string => Boolean(u))
    .filter((u) => !/\.(mp4|mov|webm|m4v)$/i.test(u))
    .slice(0, 3);

  if (shots.length === 0) return null;

  return (
    <div className="-mx-5 -mt-5 mb-5 flex gap-px overflow-hidden rounded-t-[var(--radius-lg)] sm:-mx-6 sm:-mt-6">
      {shots.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          className="h-28 flex-1 object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-32"
        />
      ))}
    </div>
  );
}

/**
 * `redacted` is the card as a stranger may see it: no name, no handle, no
 * photograph, and rates as bands rather than figures. It is what the public
 * pages show, so the marketing can demonstrate what a profile looks like
 * without giving the roster itself away.
 */
export function CreatorCard({
  creator,
  redacted = false,
}: {
  creator: CreatorRow;
  redacted?: boolean;
}) {
  const type = talentType(creator.talent_type);
  const reach = sellsReach(creator.talent_type);
  const content = sellsContent(creator.talent_type);
  const model = isModel(creator.talent_type) ? creator.model_profile : null;

  const handle =
    creator.instagram_handle ??
    creator.youtube_handle ??
    creator.x_handle ??
    creator.tiktok_handle;

  // Placement rates - what it costs to appear on their channel. Only an
  // influencer sells these.
  const placementRates = [
    { label: "Reel", value: creator.rate_reel },
    { label: "Story", value: creator.rate_story },
    { label: "Post", value: creator.rate_static_post },
    { label: "YT integration", value: creator.rate_youtube_integration },
  ].filter((r) => r.value != null);

  const formats = creator.content_formats.slice(0, 3);

  /** A figure in full, or the band it falls in on a redacted card. */
  const money = (n: number | null | undefined) =>
    redacted ? rateBand(n) : formatRupees(n);

  return (
    <article className="card group flex flex-col p-5 hover:border-ink sm:p-6">
      {showsWork(creator.talent_type) && !redacted && (
        <Showcase creator={creator} />
      )}

      <div className="flex items-start gap-3.5">
        <Avatar creator={creator} anonymous={redacted} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="display-sm truncate text-lg">
              {redacted
                ? `${creator.primary_genre} ${type.label.toLowerCase()}`
                : creator.display_name || creator.full_name}
            </h3>
            {creator.is_verified && <VerifiedMark />}
          </div>
          {handle && !redacted ? (
            <p className="truncate text-sm text-ink-faint">@{handle}</p>
          ) : (
            creator.city && (
              <p className="truncate text-sm text-ink-faint">{creator.city}</p>
            )
          )}
        </div>

        {/* The type badge, not the tier badge. Which of the two things this
            person sells is the first thing a brand needs to know. */}
        <span
          className={`badge-talent badge-talent--${creator.talent_type} shrink-0`}
        >
          {type.label}
        </span>
      </div>

      {creator.bio && !redacted && (
        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {creator.bio}
        </p>
      )}

      {/* ---- The measured row. Reach for an influencer, craft for a content
             creator. A pure creator may have no audience at all, and the
             tier function buckets a null follower count into "Nano" - so
             showing either here would be a lie rather than a blank. ---- */}
      {model ? (
        /* A model is booked for a day, so the three numbers that decide a
           shortlist are the ones on a comp card - not reach, not turnaround. */
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Metric value={formatHeight(model.height_cm) ?? "—"} label="height" />
          <Metric value={money(model.rate_full_day) ?? "—"} label="full day" />
          <Metric
            value={String(creator.showcase_media_paths.length || "—")}
            label="digitals"
          />
        </div>
      ) : reach ? (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Metric
            value={
              redacted
                ? tierLabel(creator.effective_followers)
                : compactNumber(creator.effective_followers)
            }
            label={redacted ? "audience" : "followers"}
          />
          <Metric
            value={
              creator.effective_engagement_rate != null
                ? `${creator.effective_engagement_rate}%`
                : "—"
            }
            label="engagement"
          />
          <Metric
            value={redacted ? "—" : compactNumber(creator.avg_reel_views)}
            label="avg views"
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Metric value={money(creator.rate_video) ?? "—"} label="per video" />
          <Metric
            value={
              creator.turnaround_days
                ? `${creator.turnaround_days}d`
                : "—"
            }
            label="turnaround"
          />
          <Metric
            value={String(creator.showcase_media_paths.length || "—")}
            label="samples"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {/* Tier is a statement about audience size, so it belongs only to the
            people who sell one. */}
        {reach && (
          <span className="pill pill-accent">
            {tierLabel(creator.effective_followers)}
          </span>
        )}
        {model && experienceLabel(model.experience_level) && (
          <span className="pill pill-accent">
            {experienceLabel(model.experience_level)}
          </span>
        )}
        <span className="pill">{creator.primary_genre}</span>
        {creator.city && <span className="pill">{creator.city}</span>}
        {model
          ? model.model_categories.slice(0, 3).map((c) => (
              <span key={c} className="pill">
                {c}
              </span>
            ))
          : reach
            ? creator.languages?.slice(0, 2).map((l) => (
                <span key={l} className="pill">
                  {l}
                </span>
              ))
            : formats.map((f) => (
                <span key={f} className="pill">
                  {f}
                </span>
              ))}
      </div>

      {/* ---- What it costs to book them for a day. Measurements stay off the
             card and out of the public payload: they are what a casting
             director asks for once a model is already shortlisted, not a
             browsing figure. ---- */}
      {model && (model.rate_half_day != null || model.rate_full_day != null || model.travel_willing) && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="overline mb-2">To book them</div>
          <div className="flex flex-wrap gap-1.5">
            {model.rate_half_day != null && (
              <span className="pill tabular">
                Half day{" "}
                <strong className="font-medium text-ink">
                  {money(model.rate_half_day)}
                </strong>
              </span>
            )}
            {model.rate_full_day != null && (
              <span className="pill tabular">
                Full day{" "}
                <strong className="font-medium text-ink">
                  {money(model.rate_full_day)}
                </strong>
              </span>
            )}
            {model.travel_willing && <span className="pill">Will travel</span>}
          </div>
        </div>
      )}

      {/* ---- Commercials. The two products are priced separately and are
             labelled separately, so a "Both" card never blurs them. ---- */}
      {reach && placementRates.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          {content && <div className="overline mb-2">To post on their channel</div>}
          <div className="flex flex-wrap gap-1.5">
            {placementRates.map((r) => (
              <span key={r.label} className="pill tabular">
                {r.label}{" "}
                <strong className="font-medium text-ink">
                  {money(r.value)}
                </strong>
              </span>
            ))}
            {creator.barter_open && (
              <span className="pill pill-accent">Open to barter</span>
            )}
          </div>
        </div>
      )}

      {content && creator.rate_video != null && reach && (
        <div className="mt-3.5 border-t border-line pt-3.5">
          <div className="overline mb-2">Content only, you run the ad</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="pill tabular">
              Video{" "}
              <strong className="font-medium text-ink">
                {money(creator.rate_video)}
              </strong>
            </span>
            {creator.turnaround_days && (
              <span className="pill tabular">
                {creator.turnaround_days}-day turnaround
              </span>
            )}
          </div>
        </div>
      )}

      {!reach && !model && creator.barter_open && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
          <span className="pill pill-accent">Open to barter</span>
        </div>
      )}
    </article>
  );
}
