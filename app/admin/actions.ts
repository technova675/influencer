"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAuthed, startSession } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { STATUSES, type Status } from "@/lib/taxonomy";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter the agency password." };

  // Where to land after signing in. Only a path on this site is accepted, so a
  // crafted `next` cannot turn the login form into an open redirect.
  const requested = String(formData.get("next") ?? "");
  const next = /^\/[^/\\]/.test(requested) ? requested : "/admin";

  // Blunt throttle against brute force on a single shared password.
  await new Promise((r) => setTimeout(r, 400));

  if (!checkPassword(password)) return { error: "That password is not right." };

  await startSession();
  redirect(next);
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

/** Every mutating action re-checks the session — Server Actions are reachable
 *  by direct POST, not only through our own UI. */
async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Unauthorized");
}

export async function setStatus(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as Status)) {
    throw new Error("Bad request");
  }

  const { error } = await adminClient()
    .from("creators")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/roster");
  revalidatePath("/");
}

export async function saveNote(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("internal_notes") ?? "").slice(0, 2000);
  if (!id) throw new Error("Bad request");

  const { error } = await adminClient()
    .from("creators")
    .update({ internal_notes: note || null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function markVerified(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Bad request");

  // Promotes the creator's self-reported figures to verified. Replace this
  // with a real platform API sync when one is wired up.
  const db = adminClient();
  const { data } = await db
    .from("creators")
    .select("instagram_followers,youtube_subscribers,engagement_rate")
    .eq("id", id)
    .single();

  const { error } = await db
    .from("creators")
    .update({
      verified_instagram_followers: data?.instagram_followers ?? null,
      verified_youtube_subscribers: data?.youtube_subscribers ?? null,
      verified_engagement_rate: data?.engagement_rate ?? null,
      verified_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/roster");
}
