"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:opacity-60"
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}

export function LoginForm({
  redirectTo = "/admin",
  heading = "Agency sign in",
  blurb = "The roster, its contact details and the review queue live behind this.",
}: {
  redirectTo?: string;
  heading?: string;
  blurb?: string;
}) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="card w-full max-w-sm p-8">
      <input type="hidden" name="next" value={redirectTo} />
      <h1 className="display-sm text-2xl">{heading}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{blurb}</p>

      <div className="mt-7">
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="field"
          aria-invalid={state.error ? "true" : undefined}
        />
        {state.error && (
          <p role="alert" className="mt-2 text-xs text-[#c0392b]">
            {state.error}
          </p>
        )}
      </div>

      <div className="mt-6">
        <Submit />
      </div>
    </form>
  );
}
