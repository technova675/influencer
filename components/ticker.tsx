/**
 * The band of running figures under a hero.
 *
 * It is the site's whole argument compressed into one element: before any copy
 * is read, the reader sees that this roster is quoted in numbers - a rate, an
 * engagement rate, a turnaround, a day rate - the way any other media line item
 * is. Which numbers appear depends on who the page is talking to, so an
 * influencer never sees a turnaround column and a model never sees engagement.
 *
 * The items are duplicated once so the translateX(-50%) loop is seamless;
 * `aria-hidden` on the copy keeps a screen reader from hearing the roster
 * twice. The whole strip is decorative, so it is not a live region and it
 * pauses on hover for anyone trying to actually read it.
 */
export type Tick = { label: string; value: string };

export function Ticker({ items, label }: { items: Tick[]; label: string }) {
  if (items.length === 0) return null;

  /* Keyed by position, not by label. The combined strip on the onboarding and
     brand pages splices all three roles together, and a category like FITNESS
     legitimately appears in more than one of them at different prices - so the
     label is not unique and the index is the only stable identity here. The
     list is static per render, so there is nothing for a key to preserve. */
  const run = (copy: number) =>
    items.map((t, i) => (
      <div className="tick" key={`${copy}-${i}`}>
        <span className="tick-up">{t.label}</span>
        <b>{t.value}</b>
      </div>
    ));

  return (
    <div className="ticker-wrap" role="img" aria-label={label}>
      <div className="ticker-track">
        {run(0)}
        <div className="contents" aria-hidden>
          {run(1)}
        </div>
      </div>
    </div>
  );
}
