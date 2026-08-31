"use server";

import { headers } from "next/headers";
import { adminClient } from "@/lib/supabase";
import {
  MODEL_PROFILE_FIELDS,
  creatorSubmissionSchema,
  formDataToObject,
} from "@/lib/creator-schema";
import { deleteObject, headObject, validateUpload } from "@/lib/r2";
import { checkRoleLock, formatLockDate } from "@/lib/role-lock";
import { ROLE_LOCK_DAYS } from "@/lib/roles";

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

  // One person, one role at a time. Re-submitting under the role you already
  // hold is how you update your rates and is always allowed; moving to a
  // different role is refused until the lock expires, so the roster's filters
  // keep meaning something. Checked before any media work, so a blocked
  // application costs nothing.
  const lock = await checkRoleLock(data.email, data.talent_type);
  if (lock.blocked) {
    return {
      ok: false,
      message:
        `This email is already on the roster as a ${lock.currentLabel.toLowerCase()}. ` +
        `A role can only be changed once every ${ROLE_LOCK_DAYS} days — yours unlocks on ` +
        `${formatLockDate(lock.unlocksAt)}, in ${lock.daysLeft} ` +
        `${lock.daysLeft === 1 ? "day" : "days"}. ` +
        `You can still update your ${lock.currentLabel.toLowerCase()} profile at any time, ` +
        `or email us if this is wrong.`,
      errors: { email: `Registered as a ${lock.currentLabel.toLowerCase()}` },
    };
  }

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

  // The model-only fields belong to `model_profiles`, so they are lifted out
  // before the creators row is built - passing them through would make the
  // upsert fail on columns that do not exist on that table.
  const modelFields: Record<string, unknown> = {};
  const creatorFields: Record<string, unknown> = { ...data };
  for (const key of MODEL_PROFILE_FIELDS) {
    if (key in creatorFields) {
      modelFields[key] = creatorFields[key];
      delete creatorFields[key];
    }
  }

  const row = {
    ...creatorFields,
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
    // Only stamped when the role is actually being set or changed. Re-saving
    // an unchanged role must not slide the lock forward, or nobody would ever
    // become eligible to switch.
    talent_type_changed_at:
      lock.existing?.changedAt ?? new Date().toISOString(),
  };

  // Re-submitting with the same email updates the existing row rather than
  // creating a duplicate. Status resets so edits get re-reviewed.
  const db = adminClient();
  const { data: saved, error } = await db
    .from("creators")
    .upsert(row, { onConflict: "email" })
    .select("id")
    .single();

  if (error || !saved) {
    console.error("[submitCreator]", error);
    return {
      ok: false,
      message: "Something went wrong saving your profile. Please try again.",
    };
  }

  // The second write only happens for a model, and it is keyed on the creator
  // id we just got back, so a re-submission updates the same profile rather
  // than orphaning the old one.
  if (data.talent_type === "model") {
    const { error: modelError } = await db
      .from("model_profiles")
      .upsert({ ...modelFields, talent_id: saved.id }, { onConflict: "talent_id" });

    if (modelError) {
      console.error("[submitCreator] model profile", modelError);
      return {
        ok: false,
        message:
          "Your details saved, but your measurements did not. Please submit the form again with the same email.",
      };
    }
  }

  return {
    ok: true,
    message:
      "You're on the roster. We review new profiles within two working days, and you'll hear from us when a brief matches.",
  };
}
