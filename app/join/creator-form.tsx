"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitCreator, type SubmitState } from "./actions";
import {
  AGE_BANDS,
  CITIES,
  CONTENT_FORMATS,
  GENRES,
  LANGUAGES,
  TALENT_TYPES,
  sellsContent,
  sellsReach,
  type TalentType,
} from "@/lib/taxonomy";
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
  profile_photo_path: 1,
  languages: 1,
  primary_genre: 2,
  secondary_genres: 2,
  content_formats: 2,
  instagram_handle: 3,
  instagram_followers: 3,
  engagement_rate: 3,
  portfolio_url: 3,
  showcase_media_paths: 3,
  rate_reel: 4,
  rate_ugc_video: 4,
  ugc_turnaround_days: 4,
};

const STEP_COUNT = 5;

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
        Step {step + 1} of {STEP_COUNT}
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
      className="btn btn-accent !py-3.5 text-base disabled:opacity-60 sm:!px-10"
    >
      {pending ? "Submitting…" : "Add me to the roster"}
    </button>
  );
}

/* ------------------------------------------------------------------- form */

const initial: SubmitState = { ok: false };

export function CreatorForm() {
  const [state, action] = useActionState(submitCreator, initial);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<TalentType | "">("");
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  const err = useMemo(() => state.errors ?? {}, [state.errors]);

  const reach = sellsReach(type || "influencer");
  const content = sellsContent(type || "influencer");

  // A rejected submission lands on whichever step holds the first bad field.
  // Adjusted during render rather than in an effect: this is state derived from
  // a change in the action result, and doing it here re-renders once instead of
  // painting the wrong step first.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    const keys = Object.keys(state.errors ?? {});
    if (keys.length > 0) {
      setStep(Math.min(...keys.map((k) => FIELD_STEP[k] ?? 1)));
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

  /** Native validation for the visible step only. */
  function next() {
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

  if (state.ok) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
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
    <form action={action} noValidate>
      <div ref={topRef} className="scroll-mt-24" />

      {/* Progress. Five short questions reads very differently from one long
          form, and the rail is what makes that legible before they start. */}
      <div className="mb-8">
        <div className="rail">
          <span style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }} />
        </div>
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="card p-6 sm:p-9">
        {/* ---------------------------------------------------- 0: type --- */}
        <div ref={(el) => { stepRefs.current[0] = el; }} hidden={show(0)}>
          <StepHead
            step={0}
            title="How do you work with brands?"
            blurb="This is the only question that changes the rest of the form — and it's how brands find you. Pick the one that sounds most like you."
          />
          <div className="space-y-3">
            {TALENT_TYPES.map((t) => (
              <label key={t.id} className="choice">
                <input
                  type="radio"
                  name="talent_type"
                  value={t.id}
                  required
                  checked={type === t.id}
                  onChange={() => setType(t.id)}
                />
                <span className="display-sm block text-lg">{t.label}</span>
                <span className="mt-0.5 block text-sm font-medium text-accent">
                  {t.short}
                </span>
                <span className="measure mt-2 block text-sm leading-relaxed text-ink-soft">
                  {t.blurb}
                </span>
              </label>
            ))}
          </div>
          {err.talent_type && (
            <p role="alert" className="mt-3 text-xs text-[#c0392b]">
              {err.talent_type}
            </p>
          )}
        </div>

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
              <Field label="Phone" name="phone" optional error={err.phone}>
                <Text
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  error={err.phone}
                />
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
              <Field label="City" name="city" optional>
                <select id="city" name="city" className="field">
                  <option value="">Select a city</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="State" name="state" optional>
                <Text name="state" placeholder="Maharashtra" />
              </Field>
            </div>

            <Field label="Languages you create in" name="languages" optional>
              <ChipGroup name="languages" options={LANGUAGES} />
            </Field>
          </div>
        </div>

        {/* -------------------------------------------------- 2: what ----- */}
        <div ref={(el) => { stepRefs.current[2] = el; }} hidden={show(2)}>
          <StepHead
            step={2}
            title="What you make"
            blurb="One main genre is all we need. Everything else here just widens the briefs you turn up in."
          />
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

            <Field label="Formats you deliver" name="content_formats" optional>
              <ChipGroup name="content_formats" options={CONTENT_FORMATS} />
            </Field>
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

            {!reach && (
              <Field
                label="Social handle"
                name="instagram_handle"
                optional
                hint="Only if you have one — a UGC profile does not need an audience."
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
              label={content ? "Sample work" : "Showcase photos and video"}
              name="showcase_media_paths"
              optional={reach}
              hint="Up to 6 files. Images under 8MB, video under 200MB."
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
            blurb="Rupees per deliverable. Leave blank anything you don't offer — you can always update this later by submitting the form again with the same email."
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
                  <Field label="Per UGC video" name="rate_ugc_video" optional>
                    <Text
                      name="rate_ugc_video"
                      inputMode="numeric"
                      placeholder="12000"
                    />
                  </Field>
                  <Field
                    label="Turnaround (days)"
                    name="ugc_turnaround_days"
                    optional
                    hint="From brief to delivered footage."
                    error={err.ugc_turnaround_days}
                  >
                    <Text
                      name="ugc_turnaround_days"
                      inputMode="numeric"
                      placeholder="7"
                      error={err.ugc_turnaround_days}
                    />
                  </Field>
                </div>
              </div>
            )}

            <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
              <input type="checkbox" name="barter_open" value="true" />
              I&rsquo;m open to barter collaborations
            </label>

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
          className="mt-5 rounded-[var(--radius)] bg-[#fdecea] px-4 py-3 text-sm text-[#8c2018]"
        >
          {state.message}
        </p>
      )}

      {/* ------------------------------------------------------ nav ------- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="btn btn-ghost"
          >
            Back
          </button>
        )}

        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={step === 0 && type === ""}
            className="btn btn-accent !py-3.5 text-base disabled:opacity-40 sm:!px-10"
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
