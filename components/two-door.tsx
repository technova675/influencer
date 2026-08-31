/**
 * Influencer vs creator vs model, side by side. This is the distinction
 * the roster, the cards and the join form all turn on, so it gets stated once,
 * plainly, rather than being left for a visitor to infer from the listings -
 * which they now cannot do anyway, because the roster is private.
 */
export function TalentExplainer({
  counts,
}: {
  counts?: { influencers: number; creators: number; models: number };
}) {
  const columns = [
    {
      key: "influencer" as const,
      label: "Influencer",
      line: "Sells access to their audience",
      count: counts?.influencers,
      rows: [
        ["Who posts it", "They do, on their own channel"],
        ["What you're buying", "Reach, engagement, trust"],
        ["Priced by", "Placement — per reel, story, post"],
        ["Shortlist on", "Followers, engagement rate, audience city"],
      ],
    },
    {
      key: "creator" as const,
      label: "Creator",
      line: "Sells the footage, not an audience",
      count: counts?.creators,
      rows: [
        ["Who posts it", "You do, as your own ad"],
        ["What you're buying", "The content itself, with usage rights"],
        ["Priced by", "Deliverable — per video, per turnaround"],
        ["Shortlist on", "Craft, formats, samples, speed"],
      ],
    },
    {
      key: "model" as const,
      label: "Model",
      line: "Sells the day, not the post",
      count: counts?.models,
      rows: [
        ["Who posts it", "You do — they're in the shoot, not the caption"],
        ["What you're buying", "Their time on set, plus the buyout"],
        ["Priced by", "Half day, full day, usage"],
        ["Shortlist on", "Digitals, measurements, casting, availability"],
      ],
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {columns.map((c) => (
        <div key={c.key} className="card reveal flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className={`badge-talent badge-talent--${c.key}`}>
              {c.label}
            </span>
            {c.count != null && c.count > 0 && (
              <span className="tabular text-sm text-ink-faint">
                {c.count} on the roster
              </span>
            )}
          </div>

          <h3 className="display-sm mt-4 text-xl sm:text-2xl">{c.line}</h3>

          <dl className="mt-6 space-y-3.5 border-t border-line pt-5 text-sm">
            {c.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
