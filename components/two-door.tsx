/**
 * Influencer vs creator vs model, side by side, set as three line items rather
 * than three cards.
 *
 * This is the distinction the roster, the cards and the join form all turn on,
 * so it gets stated once, plainly, rather than being left for a visitor to
 * infer from the listings - which they now cannot do anyway, because the roster
 * is private. Every column answers the same four questions in the same order,
 * which is the only way a comparison is a comparison and not three pitches.
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
        ["You're buying", "Reach, engagement, trust"],
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
        ["You're buying", "The content itself, with usage rights"],
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
        ["You're buying", "Their time on set, plus the buyout"],
        ["Priced by", "Half day, full day, usage"],
        ["Shortlist on", "Digitals, measurements, casting, availability"],
      ],
    },
  ];

  return (
    <div className="ledger md:grid-cols-3">
      {columns.map((c, i) => (
        <div key={c.key} className="reveal flex flex-col p-6 sm:p-8">
          <p
            className="overline"
            style={{ color: `var(--${c.key})` }}
          >
            Lane {String(i + 1).padStart(2, "0")} — {c.label}
          </p>

          <div className="mt-3 flex items-start justify-between gap-3">
            <h3 className="display-sm text-lg sm:text-xl">{c.line}</h3>
            {c.count != null && c.count > 0 && (
              <span className="tabular shrink-0 text-xs text-ink-faint">
                {c.count} live
              </span>
            )}
          </div>

          <dl className="mt-6 border-t border-line pt-1">
            {c.rows.map(([k, v]) => (
              <div key={k} className="spec-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
