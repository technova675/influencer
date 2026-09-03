"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitCreator, type SubmitState } from "./actions";
import {
  AGE_BANDS,
  CONTENT_FORMATS,
  EXPERIENCE_LEVELS,
  GENRES,
  LANGUAGES,
  MODEL_CATEGORIES,
  isModel,
  sellsContent,
  sellsReach,
  type TalentType,
} from "@/lib/taxonomy";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  dialFor,
} from "@/lib/country-codes";
import {
  COUNTRY_NAMES,
  DEFAULT_COUNTRY_NAME,
  citiesFor,
} from "@/lib/locations";
import type { Role } from "@/lib/roles";
import { ProfilePhotoUpload, ShowcaseUpload } from "@/components/media-upload";

/* ------------------------------------------------------------------ atoms */

function Field({
  label,
  name,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label flex items-baseline gap-2">
        {label}
        {optional && (
          <span className="text-xs font-normal text-ink-faint">Optional</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-[#c0392b]">
          {error}
        </p>
      )}
    </div>
  );
}

function Text({
  name,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      id={name}
      name={name}
      className="field"
      aria-invalid={error ? "true" : undefined}
      {...props}
    />
  );
}

/**
 * Country code and number as two controls, not one text box.
 *
 * The code is picked, so nobody has to remember whether we want "+91", "0091"
 * or nothing at all, and the number field is left holding only the digits a
 * person actually knows by heart. What posts is still a single `phone` value -
 * the two halves are joined in the hidden input, so the schema and everything
 * downstream keep seeing one number.
 */
function PhoneField({ error }: { error?: string }) {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [number, setNumber] = useState("");
  const dial = dialFor(country);
  const trimmed = number.trim();

  return (
    <div className="phone-field" data-invalid={error ? "true" : undefined}>
      <select
        name="phone_country"
        aria-label="Country dialling code"
        className="phone-code"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.iso} {c.dial}
          </option>
        ))}
      </select>
      <input
        id="phone"
        type="tel"
        inputMode="tel"
        required
        autoComplete="tel-national"
        placeholder="98765 43210"
        className="phone-number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        aria-invalid={error ? "true" : undefined}
      />
      {/* The only half that is submitted. */}
      <input
        type="hidden"
        name="phone"
        value={trimmed ? `${dial} ${trimmed}` : ""}
      />
    </div>
  );
}

function ChipGroup({
  name,
  options,
  type = "checkbox",
}: {
  name: string;
  options: readonly string[];
  type?: "checkbox" | "radio";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o} className="chip">
          <input type={type} name={name} value={o} />
          {o}
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

/**
 * Which step each field lives on, so a server-side error can send the creator
 * straight back to the question that failed instead of to the top of a form
 * they thought they had finished.
 */
const FIELD_STEP: Record<string, number> = {
  talent_type: 0,
  full_name: 1,
  display_name: 1,
  email: 1,
  phone: 1,
  bio: 1,
  city: 1,
  country: 1,
  profile_photo_path: 1,
  languages: 1,
  primary_genre: 2,
  secondary_genres: 2,
  content_formats: 2,
  model_categories: 2,
  instagram_handle: 3,
  instagram_followers: 3,
  engagement_rate: 3,
  portfolio_url: 3,
  showcase_media_paths: 3,
  height_cm: 3,
  bust_cm: 3,
  waist_cm: 3,
  hips_cm: 3,
  dress_size: 3,
  shoe_size: 3,
  hair_colour: 3,
  eye_colour: 3,
  experience_level: 3,
  agency_name: 3,
  rate_reel: 4,
  rate_video: 4,
  turnaround_days: 4,
  rate_half_day: 4,
  rate_full_day: 4,
  buyout_terms: 4,
};

const STEP_COUNT = 5;

/**
 * The mandatory fields, checked in the browser.
 *
 * A mirror of the server schema's required rules - not a replacement for it.
 * The schema in `lib/creator-schema.ts` is still the gate that decides what is
 * saved; this exists so a missing answer is caught on the step it was asked on,
 * next to the question, instead of after a round trip that lands the applicant
 * back four steps.
 *
 * Keyed by the same field names the server uses, so a client message and a
 * server message land in exactly the same slot under the field.
 */
type Ctx = { reach: boolean; model: boolean };

const HANDLES = [
  "instagram_handle",
  "youtube_handle",
  "tiktok_handle",
  "x_handle",
] as const;

const FOLLOWER_COUNTS = [
  "instagram_followers",
  "youtube_subscribers",
  "tiktok_followers",
  "x_followers",
] as const;

/** Which other fields can satisfy a rule, so typing in any one clears it. */
const SATISFIED_BY: Record<string, readonly string[]> = {
  instagram_handle: [...HANDLES, "portfolio_url", "showcase_media_paths"],
  instagram_followers: FOLLOWER_COUNTS,
};

function validateStep(
  step: number,
  fd: FormData,
  { reach, model }: Ctx,
): Record<string, string> {
  const e: Record<string, string> = {};
  const val = (k: string) => String(fd.get(k) ?? "").trim();
  const many = (k: string) => fd.getAll(k).filter((v) => v !== "");
  const num = (k: string) => Number(val(k).replace(/[,\s]/g, "")) || 0;

  if (step === 1) {
    if (val("full_name").length < 2) e.full_name = "Tell us your name";

    const email = val("email");
    if (!email) e.email = "Add your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      e.email = "That email looks off";

    // The joined "+91 98765 43210" the hidden input posts, checked against the
    // same shape the schema accepts.
    const phone = val("phone");
    if (!phone) e.phone = "Add a phone number we can reach you on";
    else if (!/^[+\d][\d\s-]{7,17}$/.test(phone))
      e.phone = "Enter a valid phone number";
  }

  if (step === 2) {
    if (!val("primary_genre")) e.primary_genre = "Pick your main genre";
    if (model && many("model_categories").length === 0)
      e.model_categories = "Pick at least one thing you get cast for";
  }

  if (step === 3) {
    if (model && !val("height_cm"))
      e.height_cm = "Height is what casting filters on — give it in centimetres";

    const hasHandle = HANDLES.some((h) => val(h));
    if (reach) {
      if (!hasHandle)
        e.instagram_handle = "Add a handle so we can see your work";
      if (FOLLOWER_COUNTS.reduce((n, k) => n + num(k), 0) <= 0)
        e.instagram_followers =
          "Enter your follower count on at least one platform";
    } else if (
      !hasHandle &&
      !val("portfolio_url") &&
      many("showcase_media_paths").length === 0
    ) {
      e.instagram_handle =
        "Add a handle, a portfolio link or a sample so we can see your work";
    }

    const portfolio = val("portfolio_url");
    if (portfolio && !/^https?:\/\/[^\s.]+\.\S+$/i.test(portfolio))
      e.portfolio_url = "Enter a full URL including https://";
  }

  return e;
}

/** Moves the applicant to the field that failed, not just to its step. */
function focusField(form: HTMLFormElement | null, name: string) {
  const el =
    form?.querySelector<HTMLElement>(`#${CSS.escape(name)}`) ??
    form?.querySelector<HTMLElement>(`[name="${name}"]`);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center", behavior: "smooth" });
}

/**
 * The role is chosen on the landing page now, not in the form, so step 0 - the
 * "how do you work with brands" question - never renders. The indices below
 * stay as they were so FIELD_STEP keeps pointing at the right question; only
 * the number shown to the applicant is shifted.
 */
const FIRST_STEP = 1;
const VISIBLE_STEPS = STEP_COUNT - FIRST_STEP;

function StepHead({
  step,
  title,
  blurb,
}: {
  step: number;
  title: string;
  blurb: string;
}) {
  return (
    <div className="mb-7">
      <p className="overline">
        Step {String(step - FIRST_STEP + 1).padStart(2, "0")} / {VISIBLE_STEPS}
      </p>
      <h2 className="display-sm mt-2.5 text-2xl sm:text-3xl">{title}</h2>
      <p className="measure mt-2.5 text-sm leading-relaxed text-ink-soft">
        {blurb}
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-accent !py-3.5 !text-sm disabled:opacity-60 sm:!px-10"
    >
      {pending ? "Submitting…" : "Add me to the roster"}
    </button>
  );
}

/* ------------------------------------------------------------------- form */

const initial: SubmitState = { ok: false };

export function CreatorForm({ role }: { role: Role }) {
  const [state, action] = useActionState(submitCreator, initial);
  const [step, setStep] = useState(FIRST_STEP);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  // An influencer who also takes content-only briefs is stored as `both`, and
  // is the one way a single applicant lands in two sets of results. It is a
  // checkbox inside the influencer flow rather than a fourth door, because
  // nobody thinks of themselves as a "both".
  const [alsoContent, setAlsoContent] = useState(false);
  const type: TalentType =
    role.talentType === "influencer" && alsoContent ? "both" : role.talentType;

  // Errors found in the browser, shown in the same slot the server's land in.
  // A server result always wins: it is the newer answer about the same fields.
  const [clientErr, setClientErr] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const err = useMemo(
    () => ({ ...clientErr, ...(state.errors ?? {}) }),
    [clientErr, state.errors],
  );

  // Country drives the city control: a curated list where we have one, a plain
  // text box everywhere else.
  const [country, setCountry] = useState(DEFAULT_COUNTRY_NAME);
  const cities = citiesFor(country);

  const reach = sellsReach(type);
  const content = sellsContent(type);
  const model = isModel(type);

  // A rejected submission lands on whichever step holds the first bad field.
  // Adjusted during render rather than in an effect: this is state derived from
  // a change in the action result, and doing it here re-renders once instead of
  // painting the wrong step first.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    setClientErr({});
    const keys = Object.keys(state.errors ?? {});
    if (keys.length > 0) {
      setStep(
        Math.max(
          FIRST_STEP,
          Math.min(...keys.map((k) => FIELD_STEP[k] ?? FIRST_STEP)),
        ),
      );
    }
  }

  // Moving between steps scrolls back to the top of the card. Skipped on the
  // first render, which would otherwise yank the page down to the form.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  const ctx = { reach, model };

  /** Every mandatory answer on the visible step, then the native constraints. */
  function next() {
    const form = formRef.current;
    const found = form ? validateStep(step, new FormData(form), ctx) : {};

    if (Object.keys(found).length > 0) {
      setClientErr(found);
      focusField(form, Object.keys(found)[0]);
      return;
    }
    setClientErr({});

    // Anything the browser knows that the rules above do not - a maxlength, a
    // malformed email the pattern let through.
    const el = stepRefs.current[step];
    const invalid = el
      ? Array.from(
          el.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >("input, select, textarea"),
        ).find((f) => !f.checkValidity())
      : undefined;

    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  }

  /**
   * Submitting checks every step, not just the last one: the applicant can
   * reach the button without ever having pressed Next on a step they skipped
   * back from. A failure cancels the action and reopens the earliest step that
   * is missing something.
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const fd = new FormData(form);
    const found: Record<string, string> = {};
    for (let i = FIRST_STEP; i < STEP_COUNT; i++) {
      Object.assign(found, validateStep(i, fd, ctx));
    }

    const keys = Object.keys(found);
    if (keys.length === 0) return;

    e.preventDefault();
    setClientErr(found);
    const target = Math.max(
      FIRST_STEP,
      Math.min(...keys.map((k) => FIELD_STEP[k] ?? FIRST_STEP)),
    );
    setStep(target);
    const first = keys.find((k) => (FIELD_STEP[k] ?? FIRST_STEP) === target);
    if (first) requestAnimationFrame(() => focusField(form, first));
  }

  /**
   * An answer clears its own error as it is typed, so a message never sits
   * under a field that has since been filled in. `SATISFIED_BY` covers the
   * rules one of several fields can answer - any handle clears the handle
   * error, any follower count clears the follower one.
   */
  function clearErrorFor(target: EventTarget | null) {
    const el = target as HTMLInputElement | null;
    const name = el?.name || el?.id;
    if (!name) return;
    setClientErr((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key === name || SATISFIED_BY[key]?.includes(name)) delete next[key];
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }

  if (state.ok) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <div
          className="mx-auto grid h-14 w-14 place-items-center bg-accent-soft"
          style={{ borderRadius: "var(--radius)" }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent" aria-hidden>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 6L9 17l-5-5"
            />
          </svg>
        </div>
        <h2 className="display-sm mt-6 text-2xl">You&rsquo;re on the roster</h2>
        <p className="measure mx-auto mt-3 leading-relaxed text-ink-soft">
          {state.message}
        </p>
      </div>
    );
  }

  // Every step stays mounted and is hidden with the `hidden` attribute rather
  // than unmounted: a hidden field still submits, so nothing typed on step 2 is
  // lost by walking forward to step 4, and the whole form still posts once.
  const show = (i: number) => (i === step ? undefined : true);

  // No encType/method on the form: React sets both automatically when `action`
  // is a function, and passing them explicitly is overridden with a console
  // warning. The file input still uploads correctly.
  return (
    /* noValidate: the browser cannot focus a required field sitting on a
       hidden step, so native submit-time validation would block the form with
       nothing on screen to fix. Each step is validated on its way past
       instead, and the server schema is the real gate. */
    <form
      ref={formRef}
      action={action}
      onSubmit={handleSubmit}
      onInput={(e) => clearErrorFor(e.target)}
      onChange={(e) => clearErrorFor(e.target)}
      noValidate
    >
      <div ref={topRef} className="scroll-mt-24" />

      {/* Progress. Five short questions reads very differently from one long
          form, and the rail is what makes that legible before they start. */}
      <div className="mb-8">
        <div className="rail">
          <span
            style={{
              width: `${((step - FIRST_STEP + 1) / VISIBLE_STEPS) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The role came from the landing page they applied through, so it is
          carried as a hidden field rather than asked again. */}
      <input type="hidden" name="talent_type" value={type} />

      <div className="card p-6 sm:p-9">
        {/* ----------------------------------------------------- 1: you --- */}
        <div ref={(el) => { stepRefs.current[1] = el; }} hidden={show(1)}>
          <StepHead
            step={1}
            title="Who you are"
            blurb="Your email and phone stay private to the agency — they are never shown on the public roster."
          />
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="full_name" error={err.full_name}>
                <Text
                  name="full_name"
                  required
                  autoComplete="name"
                  placeholder="Ananya Sharma"
                  error={err.full_name}
                />
              </Field>
              <Field
                label="Name your audience knows you by"
                name="display_name"
                optional
              >
                <Text name="display_name" placeholder="Ananya Eats" />
              </Field>
              <Field label="Email" name="email" error={err.email}>
                <Text
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  error={err.email}
                />
              </Field>
              <Field label="Phone" name="phone" error={err.phone}>
                <PhoneField error={err.phone} />
              </Field>
            </div>

            <Field
              label="Profile photo"
              name="profile_photo_path"
              optional
              hint="JPG, PNG, WebP or AVIF, under 8MB. Uploads as soon as you pick it."
              error={err.profile_photo_path}
            >
              <ProfilePhotoUpload error={err.profile_photo_path} />
            </Field>

            <Field
              label="Short bio"
              name="bio"
              optional
              hint="Two lines on what you make and who watches it."
              error={err.bio}
            >
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={800}
                className="field resize-y"
                placeholder="I make home-cooking reels for people who cook on weeknights."
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Country" name="country">
                <select
                  id="country"
                  name="country"
                  className="field"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRY_NAMES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              {/* Keyed on the country so switching it remounts the control and
                  drops a city that belongs to the country just left. */}
              <Field label="City" name="city" optional key={country}>
                {cities ? (
                  <select id="city" name="city" className="field">
                    <option value="">Select a city</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <Text name="city" placeholder="Your city" />
                )}
              </Field>
            </div>

            <Field label="Languages you create in" name="languages" optional>
              <ChipGroup name="languages" options={LANGUAGES} />
            </Field>
          </div>
        </div>

        {/* -------------------------------------------------- 2: what ----- */}
        <div ref={(el) => { stepRefs.current[2] = el; }} hidden={show(2)}>
          {model ? (
            <StepHead
              step={2}
              title="What you get cast for"
              blurb="The category is what a casting brief is written in, so pick every one you'd genuinely take. The genre is the world you sit in — fashion, beauty, fitness."
            />
          ) : (
            <StepHead
              step={2}
              title="What you make"
              blurb="One main genre is all we need. Everything else here just widens the briefs you turn up in."
            />
          )}
          <div className="space-y-5">
            <Field
              label="Primary genre"
              name="primary_genre"
              error={err.primary_genre}
            >
              <select
                id="primary_genre"
                name="primary_genre"
                required
                className="field"
                aria-invalid={err.primary_genre ? "true" : undefined}
                defaultValue=""
              >
                <option value="" disabled>
                  Select your main genre
                </option>
                {GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field label="Anything else you cover" name="secondary_genres" optional>
              <ChipGroup name="secondary_genres" options={GENRES} />
            </Field>

            {role.talentType === "influencer" && (
              <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
                <input
                  type="checkbox"
                  checked={alsoContent}
                  onChange={(e) => setAlsoContent(e.target.checked)}
                />
                I also take content-only briefs the brand runs as its own ad
              </label>
            )}

            {model ? (
              <Field
                label="Cast for"
                name="model_categories"
                hint="Pick every one you'd take a booking for."
                error={err.model_categories}
              >
                <ChipGroup name="model_categories" options={MODEL_CATEGORIES} />
              </Field>
            ) : (
              <Field label="Formats you deliver" name="content_formats" optional>
                <ChipGroup name="content_formats" options={CONTENT_FORMATS} />
              </Field>
            )}
          </div>
        </div>

        {/* ------------------------------------------- 3: reach or work --- */}
        <div ref={(el) => { stepRefs.current[3] = el; }} hidden={show(3)}>
          {reach ? (
            <StepHead
              step={3}
              title="Where your audience is"
              blurb="We check these before a profile goes live, so honest numbers work in your favour. Fill in the platforms you actually use and skip the rest."
            />
          ) : model ? (
            <StepHead
              step={3}
              title="Your stats and digitals"
              blurb="This is your comp card. Height is the one thing every casting brief filters on; the rest narrows which briefs you turn up in. Only the agency ever sees these — they are never shown publicly."
            />
          ) : (
            <StepHead
              step={3}
              title="Show us your work"
              blurb="You're selling the footage, not an audience — so samples are what get you shortlisted. No follower count needed."
            />
          )}

          <div className="space-y-5">
            {reach && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Instagram handle"
                    name="instagram_handle"
                    error={err.instagram_handle}
                  >
                    <Text
                      name="instagram_handle"
                      placeholder="@ananyaeats"
                      error={err.instagram_handle}
                    />
                  </Field>
                  <Field
                    label="Instagram followers"
                    name="instagram_followers"
                    error={err.instagram_followers}
                  >
                    <Text
                      name="instagram_followers"
                      inputMode="numeric"
                      placeholder="45,300"
                      error={err.instagram_followers}
                    />
                  </Field>
                  <Field label="YouTube handle" name="youtube_handle" optional>
                    <Text name="youtube_handle" placeholder="@ananyaeats" />
                  </Field>
                  <Field
                    label="YouTube subscribers"
                    name="youtube_subscribers"
                    optional
                  >
                    <Text
                      name="youtube_subscribers"
                      inputMode="numeric"
                      placeholder="12,000"
                    />
                  </Field>
                  <Field label="X handle" name="x_handle" optional>
                    <Text name="x_handle" placeholder="@ananyaeats" />
                  </Field>
                  <Field label="X followers" name="x_followers" optional>
                    <Text
                      name="x_followers"
                      inputMode="numeric"
                      placeholder="3,200"
                    />
                  </Field>
                  <Field
                    label="Average reel / short views"
                    name="avg_reel_views"
                    optional
                    hint="Your honest median over the last 10 posts."
                  >
                    <Text
                      name="avg_reel_views"
                      inputMode="numeric"
                      placeholder="28,000"
                    />
                  </Field>
                  <Field
                    label="Engagement rate (%)"
                    name="engagement_rate"
                    optional
                    error={err.engagement_rate}
                  >
                    <Text
                      name="engagement_rate"
                      inputMode="decimal"
                      placeholder="4.2"
                      error={err.engagement_rate}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Female audience (%)"
                    name="audience_female_pct"
                    optional
                    hint="From your platform insights."
                  >
                    <Text
                      name="audience_female_pct"
                      inputMode="decimal"
                      placeholder="68"
                    />
                  </Field>
                  <Field label="Largest age band" name="audience_age_band" optional>
                    <select
                      id="audience_age_band"
                      name="audience_age_band"
                      className="field"
                    >
                      <option value="">Select</option>
                      {AGE_BANDS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field
                  label="Top audience cities"
                  name="audience_top_cities"
                  optional
                  hint="Comma separated — Mumbai, Pune, Bengaluru"
                >
                  <Text
                    name="audience_top_cities"
                    placeholder="Mumbai, Pune, Bengaluru"
                  />
                </Field>
              </>
            )}

            {model && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Height (cm)"
                    name="height_cm"
                    hint="In centimetres, not feet — 173."
                    error={err.height_cm}
                  >
                    <Text
                      name="height_cm"
                      inputMode="numeric"
                      placeholder="173"
                      required
                      error={err.height_cm}
                    />
                  </Field>
                  <Field label="Experience" name="experience_level" optional>
                    <select
                      id="experience_level"
                      name="experience_level"
                      className="field"
                      defaultValue=""
                    >
                      <option value="">Select</option>
                      {EXPERIENCE_LEVELS.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Bust / chest (cm)" name="bust_cm" optional>
                    <Text name="bust_cm" inputMode="numeric" placeholder="86" />
                  </Field>
                  <Field label="Waist (cm)" name="waist_cm" optional>
                    <Text name="waist_cm" inputMode="numeric" placeholder="61" />
                  </Field>
                  <Field label="Hips (cm)" name="hips_cm" optional>
                    <Text name="hips_cm" inputMode="numeric" placeholder="89" />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Dress / shirt size" name="dress_size" optional>
                    <Text name="dress_size" placeholder="S / 8 / 38" />
                  </Field>
                  <Field label="Shoe size" name="shoe_size" optional>
                    <Text name="shoe_size" placeholder="UK 7" />
                  </Field>
                  <Field label="Hair colour" name="hair_colour" optional>
                    <Text name="hair_colour" placeholder="Black" />
                  </Field>
                  <Field label="Eye colour" name="eye_colour" optional>
                    <Text name="eye_colour" placeholder="Brown" />
                  </Field>
                </div>

                <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
                  <input type="checkbox" name="visible_tattoos" value="true" />
                  I have visible tattoos
                </label>

                {/* An existing exclusivity is the thing the agency has to know
                    before it pitches somebody, so it is asked plainly. */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
                    <input type="checkbox" name="agency_signed" value="true" />
                    I&rsquo;m signed to an agency
                  </label>
                  <Field label="Which agency" name="agency_name" optional>
                    <Text name="agency_name" placeholder="Agency name" />
                  </Field>
                </div>
              </>
            )}

            {!reach && !model && (
              <Field
                label="Social handle"
                name="instagram_handle"
                optional
                hint="Only if you have one — a creator profile does not need an audience."
                error={err.instagram_handle}
              >
                <Text
                  name="instagram_handle"
                  placeholder="@ananyashoots"
                  error={err.instagram_handle}
                />
              </Field>
            )}

            <Field
              label="Portfolio or media kit link"
              name="portfolio_url"
              optional={reach}
              error={err.portfolio_url}
            >
              <Text
                name="portfolio_url"
                type="url"
                placeholder="https://…"
                error={err.portfolio_url}
              />
            </Field>

            <Field
              label={
                model
                  ? "Digitals and portfolio shots"
                  : content
                    ? "Sample work"
                    : "Showcase photos and video"
              }
              name="showcase_media_paths"
              optional={reach}
              hint={
                model
                  ? "Up to 6 files. A clean headshot and a full-length, plus any book shots. Images under 8MB, video under 200MB."
                  : "Up to 6 files. Images under 8MB, video under 200MB."
              }
              error={err.showcase_media_paths}
            >
              <ShowcaseUpload />
            </Field>
          </div>
        </div>

        {/* --------------------------------------------------- 4: rates --- */}
        <div ref={(el) => { stepRefs.current[4] = el; }} hidden={show(4)}>
          <StepHead
            step={4}
            title="What you charge"
            blurb={
              model
                ? "Rupees per booking. Leave blank anything you don't offer — you can always update this later by submitting the form again with the same email."
                : "Rupees per deliverable. Leave blank anything you don't offer — you can always update this later by submitting the form again with the same email."
            }
          />

          <div className="space-y-5">
            {reach && (
              <div>
                <div className="overline mb-3">
                  To post on your own channel
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Instagram reel" name="rate_reel" optional>
                    <Text name="rate_reel" inputMode="numeric" placeholder="25000" />
                  </Field>
                  <Field label="Instagram story" name="rate_story" optional>
                    <Text name="rate_story" inputMode="numeric" placeholder="8000" />
                  </Field>
                  <Field label="Static post" name="rate_static_post" optional>
                    <Text
                      name="rate_static_post"
                      inputMode="numeric"
                      placeholder="15000"
                    />
                  </Field>
                  <Field
                    label="YouTube integration"
                    name="rate_youtube_integration"
                    optional
                  >
                    <Text
                      name="rate_youtube_integration"
                      inputMode="numeric"
                      placeholder="60000"
                    />
                  </Field>
                </div>
              </div>
            )}

            {content && (
              <div className={reach ? "border-t border-line pt-5" : ""}>
                <div className="overline mb-3">
                  Content only — the brand runs the ad
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Per Video" name="rate_video" optional>
                    <Text
                      name="rate_video"
                      inputMode="numeric"
                      placeholder="12000"
                    />
                  </Field>
                  <Field
                    label="Turnaround (days)"
                    name="turnaround_days"
                    optional
                    hint="From brief to delivered footage."
                    error={err.turnaround_days}
                  >
                    <Text
                      name="turnaround_days"
                      inputMode="numeric"
                      placeholder="7"
                      error={err.turnaround_days}
                    />
                  </Field>
                </div>
              </div>
            )}

            {model && (
              <div className="space-y-5">
                <div className="overline">To book you for a shoot</div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Half day" name="rate_half_day" optional>
                    <Text
                      name="rate_half_day"
                      inputMode="numeric"
                      placeholder="15000"
                    />
                  </Field>
                  <Field label="Full day" name="rate_full_day" optional>
                    <Text
                      name="rate_full_day"
                      inputMode="numeric"
                      placeholder="25000"
                    />
                  </Field>
                </div>

                <Field
                  label="Usage / buyout terms"
                  name="buyout_terms"
                  optional
                  hint="What the day rate covers, and what costs extra. Plain words are fine."
                >
                  <Text
                    name="buyout_terms"
                    placeholder="Day rate covers 6 months digital in India. Print quoted separately."
                  />
                </Field>

                <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
                  <input type="checkbox" name="travel_willing" value="true" />
                  I&rsquo;ll travel for a shoot
                </label>
              </div>
            )}

            {!model && (
              <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
                <input type="checkbox" name="barter_open" value="true" />
                I&rsquo;m open to barter collaborations
              </label>
            )}

            <Field
              label="Brands you've worked with"
              name="past_brands"
              optional
              hint="Comma separated."
            >
              <Text name="past_brands" placeholder="Mamaearth, Swiggy, boAt" />
            </Field>

            <Field
              label="Links to your best work"
              name="notable_work_urls"
              optional
              hint="Comma separated URLs."
            >
              <Text
                name="notable_work_urls"
                placeholder="https://instagram.com/reel/…"
              />
            </Field>
          </div>
        </div>
      </div>

      {state.message && !state.ok && (
        <p
          role="alert"
          className="mt-5 rounded-[var(--radius)] border border-[#e2b4ae] bg-[#fdecea] px-4 py-3 text-sm text-[#8c2018]"
        >
          {state.message}
        </p>
      )}

      {/* ------------------------------------------------------ nav ------- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > FIRST_STEP && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(FIRST_STEP, s - 1))}
            className="btn btn-ghost"
          >
            Back
          </button>
        )}

        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={next}
            className="btn btn-accent !py-3.5 text-base sm:!px-10"
          >
            Continue
          </button>
        ) : (
          <SubmitButton />
        )}

        <p className="text-xs leading-relaxed text-ink-faint">
          Free, and your contact details are never shown publicly.
        </p>
      </div>
    </form>
  );
}
