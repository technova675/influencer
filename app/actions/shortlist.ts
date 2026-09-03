"use server";

import { headers } from "next/headers";
import { adminClient } from "@/lib/supabase";
import {
  shortlistFormToObject,
  shortlistRequestSchema,
} from "@/lib/shortlist-schema";

export type ShortlistState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Fresh on every accepted send. The form keys its dropdowns on this to
      clear them, which is derived state rather than a counter kept in an
      effect. */
  sentId?: string;
};

export const initialShortlistState: ShortlistState = { ok: false };

/**
 * Records a request for a shortlist.
 *
 * This is the whole hiring-side funnel now - one row, written from the bar on
 * the landing page. It deliberately does not try to match anyone: which
 * profiles go on the shortlist is decided by the agency team, and the roster
 * stays private either way.
 */
export async function submitShortlist(
  _prev: ShortlistState,
  formData: FormData,
): Promise<ShortlistState> {
  const parsed = shortlistRequestSchema.safeParse(
    shortlistFormToObject(formData),
  );

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  // A filled honeypot means a bot. Report success so it does not learn it was
  // caught, but write nothing.
  const { website, ...data } = parsed.data;
  if (website)
    return {
      ok: true,
      message: "Thanks — we'll be in touch.",
      sentId: crypto.randomUUID(),
    };

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");

  const { error } = await adminClient()
    .from("shortlist_requests")
    .insert({
      ...data,
      submitted_ip: forwarded?.split(",")[0]?.trim() || null,
      submitted_user_agent: h.get("user-agent")?.slice(0, 400) ?? null,
    });

  if (error) {
    console.error("[submitShortlist]", error);
    return {
      ok: false,
      message: "Something went wrong sending that. Please try again.",
    };
  }

  return {
    ok: true,
    sentId: crypto.randomUUID(),
    message:
      "Got it. We'll come back with a shortlist — the profiles that fit, and nothing else.",
  };
}
