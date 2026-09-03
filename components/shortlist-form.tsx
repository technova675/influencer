"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  initialShortlistState,
  submitShortlist,
} from "@/app/actions/shortlist";
import { CITIES, GENRES, TALENT_TYPES } from "@/lib/taxonomy";
import { ShortlistSelect } from "@/components/shortlist-select";

/* The three dropdowns are plain lists of strings apart from talent type, whose
   stored id and shown label differ. "Both" is how a talent describes
   themselves, not something anyone hires for, so it is not offered here. */
const TALENT_OPTIONS = TALENT_TYPES.filter((t) => t.id !== "both").map((t) => ({
  value: t.id,
  label: t.label,
}));
const GENRE_OPTIONS = GENRES.map((g) => ({ value: g, label: g }));
const CITY_OPTIONS = CITIES.map((c) => ({ value: c, label: c }));

/**
 * The shortlist bar.
 *
 * One row of fields and one button, sitting on the landing page itself. It
 * replaces the old two-step route - a CTA that navigated to a separate page
 * carrying a long brief form - because the navigation was the drop-off. There
 * is nowhere to go now: the CTAs scroll here, and the request is sent from
 * where it was asked for.
 *
 * The fields are the shortest set that makes a request actionable. Everything
 * except the name and email is optional, so a blank category or city is a
 * wider search rather than a blocked submit.
 */

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="sl-submit" disabled={pending}>
      {pending ? "Sending…" : "Get shortlist →"}
    </button>
  );
}

export function ShortlistForm() {
  const [state, action] = useActionState(submitShortlist, initialShortlistState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  // A successful send clears the row, so the bar reads as ready for the next
  // request rather than as a form still holding a sent one. The inputs are
  // cleared by reset(); the dropdowns hold their own state, so they are keyed
  // on the send id instead and remount.
  const sent = state.sentId ?? "new";

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
    if (state.message) statusRef.current?.focus();
  }, [state]);

  const err = (field: string) => state.errors?.[field];

  return (
    <section className="sl-wrap" id="shortlist">
      <div className="wrap">
        <div className="sl-bar">
          <div className="sl-head">
            <h2 className="sl-title">
              Find your next face — shortlist in 48h
            </h2>
            <p className="sl-note">
              Tell us who you need. We filter the roster and come back with the
              profiles that fit, rates already attached.
            </p>
          </div>

          <form ref={formRef} action={action} className="sl-row" noValidate>
            {/* Keyed on the send count so a successful submit resets them
                alongside the inputs: form.reset() cannot reach state held in a
                custom control. */}
            <ShortlistSelect
              key={`talent-${sent}`}
              name="talent_type"
              label="Looking for"
              options={TALENT_OPTIONS}
              defaultValue="influencer"
            />

            <ShortlistSelect
              key={`genre-${sent}`}
              name="genre"
              label="Category"
              options={GENRE_OPTIONS}
              placeholder="Any"
            />

            <ShortlistSelect
              key={`city-${sent}`}
              name="city"
              label="City"
              options={CITY_OPTIONS}
              placeholder="Anywhere"
            />

            <label className={`sl-field${err("full_name") ? " sl-bad" : ""}`}>
              <span className="sl-label">Your name</span>
              <input
                name="full_name"
                autoComplete="name"
                placeholder="Alex Sharma"
                aria-invalid={err("full_name") ? true : undefined}
              />
            </label>

            <label className={`sl-field${err("email") ? " sl-bad" : ""}`}>
              <span className="sl-label">Work email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={err("email") ? true : undefined}
              />
            </label>

            <label className="sl-field">
              <span className="sl-label">Phone / Instagram</span>
              {/* A full 12-digit number with its country code, so the field
                  is visibly sized for one rather than eliding at "+91…". */}
              <input
                name="contact_handle"
                placeholder="+91 98765 43210"
              />
            </label>

            {/* Honeypot. Off-screen rather than display:none, which some bots
                skip, and hidden from assistive tech either way. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sl-hp"
            />

            <Submit />
          </form>

          {state.message && (
            <p
              ref={statusRef}
              tabIndex={-1}
              role="status"
              className={`sl-msg${state.ok ? " sl-ok" : " sl-err"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
