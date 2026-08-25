import { cookies } from "next/headers";

/**
 * Deliberately small: one shared agency password, an HMAC-signed cookie, no
 * user table. Swap for Supabase Auth when the agency needs per-person logins.
 */

const COOKIE = "roster_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set in .env.local");
  return new TextEncoder().encode(s);
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    secret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString("base64url");
}

/** Constant-time compare, so a wrong password leaks no timing information. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken() {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = String(expires);
  return `${payload}.${await sign(payload)}`;
}

export async function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, await sign(payload))) return false;
  return Number(payload) > Date.now();
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set in .env.local");
  return safeEqual(input, expected);
}

export async function isAuthed() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function startSession() {
  const jar = await cookies();
  jar.set(COOKIE, await createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
