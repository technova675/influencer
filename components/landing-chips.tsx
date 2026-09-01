"use client";

import { useState } from "react";

/**
 * The genre filter bar.
 *
 * Reproduces the reference's behaviour exactly: clicking a chip moves the
 * `active` class and nothing else. The reference's own script calls this
 * "filter chip interaction (visual only)", and the ledger beneath it is a fixed
 * sample rather than a queryable list, so there is nothing here to filter.
 *
 * Rendered as buttons rather than the reference's spans because they are
 * clickable: a span carries no keyboard focus and no pressed state, so a
 * keyboard or screen-reader user could neither reach nor read it. The classes,
 * and therefore the appearance, are unchanged.
 */
const CHIPS = [
  "All genres",
  "Fashion",
  "Food",
  "Fitness",
  "Tech",
  "Finance",
  "Comedy",
  "Travel",
];

export function LandingChips() {
  const [active, setActive] = useState("All genres");

  return (
    <div className="filter-bar">
      {CHIPS.map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={active === c}
          onClick={() => setActive(c)}
          className={active === c ? "chip active" : "chip"}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
