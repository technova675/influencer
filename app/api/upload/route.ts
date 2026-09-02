import { NextResponse, type NextRequest } from "next/server";
import { objectKey, presignUpload, validateUpload, type UploadKind } from "@/lib/r2";
import { publicMediaUrl } from "@/lib/media";

/**
 * Hands out a short-lived presigned PUT so the browser uploads straight to R2.
 *
 * Why not upload through a Server Action: Server Action bodies are size-capped
 * and the bytes would travel via our server for no benefit. Direct-to-R2 keeps
 * a 200MB video off the function entirely.
 *
 * This endpoint is necessarily public - creators submit before they have an
 * account - so it is rate limited and the signature pins the exact content
 * type. Byte length is not signable on a presigned PUT; it is validated here
 * before signing and re-checked against the stored object on submit.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many uploads. Wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: { contentType?: string; contentLength?: number; kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const kind: UploadKind = body.kind === "showcase" ? "showcase" : "profile";
  const contentType = String(body.contentType ?? "");
  const contentLength = Number(body.contentLength ?? 0);

  const check = validateUpload(contentType, contentLength, kind);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const key = objectKey(kind, contentType);
    const uploadUrl = await presignUpload(key, contentType);
    return NextResponse.json(
      { uploadUrl, key, publicUrl: publicMediaUrl(key) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[upload/presign]", error);
    return NextResponse.json(
      { error: "Could not start the upload. Check the R2 settings." },
      { status: 500 },
    );
  }
}
