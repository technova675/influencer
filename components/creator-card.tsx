import {
  compactNumber,
  formatRupees,
  sellsContent,
  sellsReach,
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

function Avatar({ creator, size = 56 }: { creator: CreatorRow; size?: number }) {
  const url = publicMediaUrl(creator.profile_photo_path);
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-black/5"
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
      ) : (
        <Initials name={creator.full_name} />
      )}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="stat-figure tabular text-xl leading-none">{value}</div>
      <div className="mt-1.5 truncate text-xs text-ink-faint">{label}</div>
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
 * The strip along the top of the card. A UGC creator sells the footage, so the
 * first thing on their card is the footage - it does the job a follower count
 * does for an influencer. Nobody with no samples gets an empty grey box.
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

export function CreatorCard({ creator }: { creator: CreatorRow }) {
  const type = talentType(creator.talent_type);
  const reach = sellsReach(creator.talent_type);
  const content = sellsContent(creator.talent_type);

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

  return (
    <article className="card group flex flex-col p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] sm:p-6">
      {content && <Showcase creator={creator} />}

      <div className="flex items-start gap-3.5">
        <Avatar creator={creator} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="display-sm truncate text-lg">
              {creator.display_name || creator.full_name}
            </h3>
            {creator.is_verified && <VerifiedMark />}
          </div>
          {handle ? (
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

      {creator.bio && (
        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {creator.bio}
        </p>
      )}

      {/* ---- The measured row. Reach for an influencer, craft for a UGC
             creator. A pure UGC creator may have no audience at all, and the
             tier function buckets a null follower count into "Nano" - so
             showing either here would be a lie rather than a blank. ---- */}
      {reach ? (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Metric
            value={compactNumber(creator.effective_followers)}
            label="followers"
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
            value={compactNumber(creator.avg_reel_views)}
            label="avg views"
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Metric
            value={
              creator.rate_ugc_video != null
                ? (formatRupees(creator.rate_ugc_video) ?? "—")
                : "—"
            }
            label="per video"
          />
          <Metric
            value={
              creator.ugc_turnaround_days
                ? `${creator.ugc_turnaround_days}d`
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
        <span className="pill">{creator.primary_genre}</span>
        {creator.city && <span className="pill">{creator.city}</span>}
        {reach
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
                  {formatRupees(r.value)}
                </strong>
              </span>
            ))}
            {creator.barter_open && (
              <span className="pill pill-accent">Open to barter</span>
            )}
          </div>
        </div>
      )}

      {content && creator.rate_ugc_video != null && reach && (
        <div className="mt-3.5 border-t border-line pt-3.5">
          <div className="overline mb-2">Content only, you run the ad</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="pill tabular">
              UGC video{" "}
              <strong className="font-medium text-ink">
                {formatRupees(creator.rate_ugc_video)}
              </strong>
            </span>
            {creator.ugc_turnaround_days && (
              <span className="pill tabular">
                {creator.ugc_turnaround_days}-day turnaround
              </span>
            )}
          </div>
        </div>
      )}

      {!reach && creator.barter_open && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
          <span className="pill pill-accent">Open to barter</span>
        </div>
      )}
    </article>
  );
}
