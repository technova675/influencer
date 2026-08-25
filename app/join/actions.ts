"use server";

import { headers } from "next/headers";
import { adminClient } from "@/lib/supabase";
import {
  creatorSubmissionSchema,
  formDataToObject,
} from "@/lib/creator-schema";
import { deleteObject, headObject, validateUpload } from "@/lib/r2";

export type SubmitState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/**
 * Media never passes through here. The browser uploads straight to Cloudflare
 * R2 via a presigned URL from /api/upload, and the form carries only the
 * resulting object keys - so a 200MB video never touches this function.
 */
export async function submitCreator(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const raw = formDataToObject(formData);
  const parsed = creatorSubmissionSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  // Honeypot: a filled `website` field means a bot. Report success so it does
  // not learn it was caught, but write nothing.
  const { website, ...data } = parsed.data;
  if (website) return { ok: true, message: "Thanks — we'll be in touch." };

  // A presigned PUT pins the content type but not the byte count, so confirm
  // what actually landed in the bucket before we record a reference to it.
  // Anything missing or oversized is dropped rather than failing the whole
  // submission - the profile is worth more than the attachment.
  const claimed = [
    data.profile_photo_path,
    ...(data.showcase_media_paths ?? []),
  ].filter(Boolean) as string[];

  const verified = new Set<string>();
  await Promise.all(
    claimed.map(async (key) => {
      try {
        const meta = await headObject(key);
        if (!meta) return;
        const check = validateUpload(
          meta.contentType,
          meta.size,
          key.startsWith("profile/") ? "profile" : "showcase",
        );
        if (check.ok) verified.add(key);
        else await deleteObject(key).catch(() => {});
      } catch (e) {
        console.error("[submitCreator] media check failed", key, e);
      }
    }),
  );

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");

  const row = {
    ...data,
    profile_photo_path:
      data.profile_photo_path && verified.has(data.profile_photo_path)
        ? data.profile_photo_path
        : null,
    showcase_media_paths: (data.showcase_media_paths ?? []).filter((k) =>
      verified.has(k),
    ),
    submitted_ip: forwarded?.split(",")[0]?.trim() || null,
    submitted_user_agent: h.get("user-agent")?.slice(0, 400) ?? null,
    status: "pending" as const,
  };

  // Re-submitting with the same email updates the existing row rather than
  // creating a duplicate. Status resets so edits get re-reviewed.
  const { error } = await adminClient()
    .from("creators")
    .upsert(row, { onConflict: "email" });

  if (error) {
    console.error("[submitCreator]", error);
    return {
      ok: false,
      message: "Something went wrong saving your profile. Please try again.",
    };
  }

  return {
    ok: true,
    message:
      "You're on the roster. We review new profiles within two working days, and you'll hear from us when a brief matches.",
  };
}
