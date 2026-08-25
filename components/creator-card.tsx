import { compactNumber, formatRupees, tierLabel } from "@/lib/taxonomy";
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

export function CreatorCard({ creator }: { creator: CreatorRow }) {
  const handle =
    creator.instagram_handle ??
    creator.youtube_handle ??
    creator.x_handle ??
    creator.tiktok_handle;

  const rates = [
    { label: "Reel", value: creator.rate_reel },
    { label: "Story", value: creator.rate_story },
    { label: "Post", value: creator.rate_static_post },
    { label: "YT integration", value: creator.rate_youtube_integration },
  ].filter((r) => r.value != null);

  return (
    <article className="card group flex flex-col p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] sm:p-6">
      <div className="flex items-start gap-3.5">
        <Avatar creator={creator} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="display-sm truncate text-lg">
              {creator.display_name || creator.full_name}
            </h3>
            {creator.is_verified && (
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
                <path
                  fill="#fff"
                  d="M8.9 12.6L6.4 10l1-1 1.5 1.5 3.7-3.7 1 1z"
                />
              </svg>
            )}
          </div>
          {handle && (
            <p className="truncate text-sm text-ink-faint">@{handle}</p>
          )}
        </div>
        <span className="pill pill-accent shrink-0">
          {tierLabel(creator.effective_followers)}
        </span>
      </div>

      {creator.bio && (
        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {creator.bio}
        </p>
      )}

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

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="pill">{creator.primary_genre}</span>
        {creator.city && <span className="pill">{creator.city}</span>}
        {creator.languages?.slice(0, 2).map((l) => (
          <span key={l} className="pill">
            {l}
          </span>
        ))}
      </div>

      {rates.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
          {rates.map((r) => (
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
      )}
    </article>
  );
}
