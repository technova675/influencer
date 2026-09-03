"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * The dropdown used by the shortlist bar.
 *
 * A native <select> cannot be styled past its own box: the option list is drawn
 * by the operating system, in the OS's colours, so on the bar's ink ground it
 * opened as a bright grey slab that belonged to no part of this site. This is
 * the same control rebuilt out of a button and a listbox, so the open state is
 * styled like everything else on the page.
 *
 * The value still reaches the server through a hidden input carrying the same
 * `name`, so the server action and its schema are untouched by any of this.
 *
 * Keyboard behaviour follows the ARIA combobox pattern, because a rebuilt
 * control that a keyboard cannot drive is a downgrade from the native one it
 * replaced: arrows move, Enter and Space commit, Escape closes without
 * committing, Home and End jump, and typing a letter jumps to the next option
 * starting with it.
 */

export type SelectOption = { value: string; label: string };

export function ShortlistSelect({
  name,
  label,
  options,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  label: string;
  options: readonly SelectOption[];
  defaultValue?: string;
  /** Shown when the value is "". Omit if the field always holds a value. */
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ buffer: "", at: 0 });

  const listId = useId();
  const labelId = useId();

  const all: SelectOption[] = useMemo(
    () =>
      placeholder
        ? [{ value: "", label: placeholder }, ...options]
        : [...options],
    [options, placeholder],
  );

  const selectedIndex = Math.max(
    0,
    all.findIndex((o) => o.value === value),
  );
  const current = all[selectedIndex];

  const openList = useCallback(() => {
    setActive(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = all[index];
      if (option) setValue(option.value);
      close();
    },
    [all, close],
  );

  // Pointer down rather than click: a click outside would otherwise land on
  // whatever is underneath only after the panel had already swallowed it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted option in view when the list is long enough to
  // scroll - Genres and Cities both are.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLLIElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const move = (to: number) => {
    const next = Math.max(0, Math.min(all.length - 1, to));
    if (open) setActive(next);
    else setValue(all[next]!.value);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const from = open ? active : selectedIndex;

    switch (e.key) {
      // Closed, the arrows step the value without opening, which is what a
      // native select does. Alt+Down opens instead, per the ARIA pattern.
      case "ArrowDown":
        e.preventDefault();
        if (!open && e.altKey) openList();
        else move(from + 1);
        return;
      case "ArrowUp":
        e.preventDefault();
        move(from - 1);
        return;
      case "Home":
        if (!open) return;
        e.preventDefault();
        move(0);
        return;
      case "End":
        if (!open) return;
        e.preventDefault();
        move(all.length - 1);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(active);
        else openList();
        return;
      case "Escape":
        if (!open) return;
        e.preventDefault();
        close();
        return;
      case "Tab":
        if (open) setOpen(false);
        return;
    }

    // Type-ahead. Consecutive keystrokes within a second build up a prefix, so
    // "ba" reaches Bangalore rather than stopping at Beauty.
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    const now = Date.now();
    const t = typed.current;
    t.buffer = now - t.at > 1000 ? e.key : t.buffer + e.key;
    t.at = now;

    const prefix = t.buffer.toLowerCase();
    const start = open ? active : selectedIndex;
    for (let i = 1; i <= all.length; i++) {
      const index = (start + i) % all.length;
      if (all[index]!.label.toLowerCase().startsWith(prefix)) {
        e.preventDefault();
        if (open) setActive(index);
        else setValue(all[index]!.value);
        return;
      }
    }
  };

  return (
    <div className="sl-field sl-select" ref={rootRef}>
      <span className="sl-label" id={labelId}>
        {label}
      </span>

      {/* The real value. Named, so the form posts exactly what a <select>
          would have posted. */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-labelledby={`${labelId} ${listId}-value`}
        className="sl-select-button"
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span
          id={`${listId}-value`}
          className={value ? "sl-select-value" : "sl-select-value sl-select-empty"}
        >
          {current?.label}
        </span>
        <svg className="sl-caret" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 8L2 4h8z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className="sl-options"
        >
          {all.map((o, i) => (
            <li
              key={o.value || "__any"}
              role="option"
              data-index={i}
              aria-selected={o.value === value}
              data-active={i === active || undefined}
              className="sl-option"
              onMouseEnter={() => setActive(i)}
              // Mouse down rather than click, so the button does not blur
              // first and close the panel out from under the pointer.
              onMouseDown={(e) => {
                e.preventDefault();
                commit(i);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
