"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitCreator, type SubmitState } from "./actions";
import {
  AGE_BANDS,
  CITIES,
  CONTENT_FORMATS,
  GENRES,
  LANGUAGES,
} from "@/lib/taxonomy";
import { ProfilePhotoUpload, ShowcaseUpload } from "@/components/media-upload";

/* ------------------------------------------------------------------ atoms */

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>
      )}
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

function Section({
  step,
  title,
  blurb,
  children,
}: {
  step: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="card p-6 sm:p-8">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline gap-3">
        <span className="figure-plain text-lg text-ink-faint">
          {step}
        </span>
        <h2 className="display-sm text-xl sm:text-2xl">{title}</h2>
      </div>
      {blurb && (
        <p className="measure mt-2 text-sm leading-relaxed text-ink-soft">
          {blurb}
        </p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-accent w-full !py-3.5 text-base disabled:opacity-60 sm:w-auto sm:!px-10"
    >
      {pending ? "Submitting…" : "Add me to the roster"}
    </button>
  );
}

/* ------------------------------------------------------------------- form */

const initial: SubmitState = { ok: false };

export function CreatorForm() {
  const [state, action] = useActionState(submitCreator, initial);
  const err = state.errors ?? {};

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

  // No encType/method on the form: React sets both automatically when `action`
  // is a function, and passing them explicitly is overridden with a console
  // warning. The file input still uploads correctly.
  return (
    <form action={action} className="space-y-5" noValidate>
      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Section
        step="01"
        title="Who you are"
        blurb="The basics. Your email is how we reach you when a brief matches — it is never shown publicly."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="full_name" error={err.full_name}>
            <Text name="full_name" required placeholder="Ananya Sharma" error={err.full_name} />
          </Field>
          <Field
            label="Display name"
            name="display_name"
            hint="Optional — the name your audience knows"
          >
            <Text name="display_name" placeholder="Ananya Eats" />
          </Field>
          <Field label="Email" name="email" error={err.email}>
            <Text name="email" type="email" required placeholder="you@email.com" error={err.email} />
          </Field>
          <Field label="Phone" name="phone" error={err.phone}>
            <Text name="phone" type="tel" placeholder="+91 98765 43210" error={err.phone} />
          </Field>
        </div>

        <Field
          label="Short bio"
          name="bio"
          hint="Two lines on what you make and who watches it."
          error={err.bio}
        >
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={800}
            className="field resize-y"
            placeholder="I make South Indian home-cooking reels for people who cook on weeknights."
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" name="city">
            <select id="city" name="city" className="field">
              <option value="">Select a city</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="State" name="state">
            <Text name="state" placeholder="Maharashtra" />
          </Field>
        </div>

        <Field
          label="Profile photo"
          name="profile_photo_path"
          hint="JPG, PNG, WebP or AVIF, under 8MB. Uploads as soon as you pick it."
          error={err.profile_photo_path}
        >
          <ProfilePhotoUpload error={err.profile_photo_path} />
        </Field>

        <Field label="Languages you create in" name="languages">
          <ChipGroup name="languages" options={LANGUAGES} />
        </Field>
      </Section>

      <Section
        step="02"
        title="What you make"
        blurb="Pick one main genre. Secondary genres widen the briefs you show up in."
      >
        <Field label="Primary genre" name="primary_genre" error={err.primary_genre}>
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

        <Field label="Secondary genres" name="secondary_genres">
          <ChipGroup name="secondary_genres" options={GENRES} />
        </Field>

        <Field label="Formats you deliver" name="content_formats">
          <ChipGroup name="content_formats" options={CONTENT_FORMATS} />
        </Field>
      </Section>

      <Section
        step="03"
        title="Where your audience is"
        blurb="Add every platform you're active on. We verify these before a profile goes live, so accurate numbers work in your favour."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram handle" name="instagram_handle" error={err.instagram_handle}>
            <Text name="instagram_handle" placeholder="@ananyaeats" error={err.instagram_handle} />
          </Field>
          <Field label="Instagram followers" name="instagram_followers" error={err.instagram_followers}>
            <Text
              name="instagram_followers"
              inputMode="numeric"
              placeholder="45,300"
              error={err.instagram_followers}
            />
          </Field>
          <Field label="YouTube handle" name="youtube_handle">
            <Text name="youtube_handle" placeholder="@ananyaeats" />
          </Field>
          <Field label="YouTube subscribers" name="youtube_subscribers">
            <Text name="youtube_subscribers" inputMode="numeric" placeholder="12,000" />
          </Field>
          <Field label="X handle" name="x_handle">
            <Text name="x_handle" placeholder="@ananyaeats" />
          </Field>
          <Field label="X followers" name="x_followers">
            <Text name="x_followers" inputMode="numeric" placeholder="3,200" />
          </Field>
          <Field
            label="Average reel / short views"
            name="avg_reel_views"
            hint="Your honest median over the last 10 posts."
          >
            <Text name="avg_reel_views" inputMode="numeric" placeholder="28,000" />
          </Field>
          <Field label="Engagement rate (%)" name="engagement_rate" error={err.engagement_rate}>
            <Text name="engagement_rate" inputMode="decimal" placeholder="4.2" error={err.engagement_rate} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Female audience (%)"
            name="audience_female_pct"
            hint="From your platform insights."
          >
            <Text name="audience_female_pct" inputMode="decimal" placeholder="68" />
          </Field>
          <Field label="Largest age band" name="audience_age_band">
            <select id="audience_age_band" name="audience_age_band" className="field">
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
          hint="Comma separated — Mumbai, Pune, Bengaluru"
        >
          <Text name="audience_top_cities" placeholder="Mumbai, Pune, Bengaluru" />
        </Field>

        <Field label="Portfolio or media kit link" name="portfolio_url" error={err.portfolio_url}>
          <Text name="portfolio_url" type="url" placeholder="https://…" error={err.portfolio_url} />
        </Field>

        <Field
          label="Showcase photos and video"
          name="showcase_media_paths"
          hint="Up to 6 files. Images under 8MB, video under 200MB."
          error={err.showcase_media_paths}
        >
          <ShowcaseUpload />
        </Field>
      </Section>

      <Section
        step="04"
        title="What you charge"
        blurb="Rates in rupees per deliverable. Leave anything blank that you don't offer — a filled rate card gets you into more shortlists."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram reel" name="rate_reel">
            <Text name="rate_reel" inputMode="numeric" placeholder="25000" />
          </Field>
          <Field label="Instagram story" name="rate_story">
            <Text name="rate_story" inputMode="numeric" placeholder="8000" />
          </Field>
          <Field label="Static post" name="rate_static_post">
            <Text name="rate_static_post" inputMode="numeric" placeholder="15000" />
          </Field>
          <Field label="YouTube integration" name="rate_youtube_integration">
            <Text name="rate_youtube_integration" inputMode="numeric" placeholder="60000" />
          </Field>
          <Field label="UGC video (no posting)" name="rate_ugc_video">
            <Text name="rate_ugc_video" inputMode="numeric" placeholder="12000" />
          </Field>
        </div>

        <label className="chip !rounded-[var(--radius)] !px-4 !py-3">
          <input type="checkbox" name="barter_open" value="true" />
          I&rsquo;m open to barter collaborations
        </label>

        <Field
          label="Brands you've worked with"
          name="past_brands"
          hint="Comma separated."
        >
          <Text name="past_brands" placeholder="Mamaearth, Swiggy, boAt" />
        </Field>

        <Field
          label="Links to your best work"
          name="notable_work_urls"
          hint="Comma separated URLs."
        >
          <Text name="notable_work_urls" placeholder="https://instagram.com/reel/…" />
        </Field>
      </Section>

      {state.message && !state.ok && (
        <p
          role="alert"
          className="rounded-[var(--radius)] bg-[#fdecea] px-4 py-3 text-sm text-[#8c2018]"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
        <SubmitButton />
        <p className="text-xs leading-relaxed text-ink-faint">
          Your contact details stay private to the agency and are never shown on
          the public roster.
        </p>
      </div>
    </form>
  );
}
