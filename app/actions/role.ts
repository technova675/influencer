"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_COOKIE, roleById } from "@/lib/roles";

const YEAR = 60 * 60 * 24 * 365;

/**
 * The onboarding choice. Remembers which door somebody came through so a
 * returning visitor lands back on their own page instead of being asked again,
 * and sends them to it.
 *
 * A plain form post rather than a link, because choosing is a decision we
 * record - and it keeps working with JavaScript turned off.
 */
export async function chooseRole(formData: FormData) {
  const role = roleById(String(formData.get("role") ?? ""));

  // "brand" is a valid door but not a talent role, so it is handled here
  // rather than living in ROLES. The page it used to open is parked in
  // app/_for-brands (a leading underscore keeps a folder out of the router),
  // so the door now lands on the shortlist bar instead.
  if (!role) {
    if (String(formData.get("role")) === "brand") {
      const jar = await cookies();
      jar.set(ROLE_COOKIE, "brand", { path: "/", maxAge: YEAR, sameSite: "lax" });
      // redirect("/for-brands");
      redirect("/#shortlist");
    }
    redirect("/");
  }

  const jar = await cookies();
  jar.set(ROLE_COOKIE, role.id, { path: "/", maxAge: YEAR, sameSite: "lax" });
  redirect(role.slug);
}

/** Forgets the choice, so the chooser is shown again. */
export async function clearRole() {
  const jar = await cookies();
  jar.delete(ROLE_COOKIE);
  redirect("/");
}
