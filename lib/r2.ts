import "server-only";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_TYPES,
} from "./media";

/**
 * Cloudflare R2 over AWS SigV4, signed here with Web Crypto.
 *
 * No @aws-sdk dependency on purpose. It is a very large package, and Next
 * externalises it by symlinking into .next/node_modules - which cannot work on
 * a filesystem without junction support (this project lives on an exFAT drive).
 * Signing directly is ~80 lines, has no install footprint, and works anywhere.
 *
 * R2 specifics: region is always the literal "auto", and the endpoint is
 * per-account rather than per-region.
 */

const REGION = "auto";
const SERVICE = "s3";
const ALGORITHM = "AWS4-HMAC-SHA256";

function env(name: string) {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing ${name}. Add it to .env.local and restart the dev server.`,
    );
  }
  return v.trim();
}

const host = () => `${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`;

/* -------------------------------------------------------------- primitives */

const enc = new TextEncoder();

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(data: string | Uint8Array) {
  const bytes = typeof data === "string" ? enc.encode(data) : data;
  return hex(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
}

/** RFC 3986. encodeURIComponent leaves !'()* alone, and AWS requires them encoded. */
function uriEncode(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** Object keys contain "/" as real path separators, so encode per segment. */
function encodeKey(key: string) {
  return key.split("/").map(uriEncode).join("/");
}

async function signingKey(datestamp: string) {
  const kDate = await hmac(enc.encode(`AWS4${env("R2_SECRET_ACCESS_KEY")}`), datestamp);
  const kRegion = await hmac(kDate, REGION);
  const kService = await hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function timestamps() {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amzDate, datestamp: amzDate.slice(0, 8) };
}

/* ------------------------------------------------------------- public API */

export const R2_BUCKET = () => env("R2_BUCKET");

export type UploadKind = "profile" | "showcase";

export function validateUpload(
  contentType: string,
  contentLength: number,
  kind: UploadKind,
) {
  const isImage = IMAGE_TYPES.includes(contentType);
  const isVideo = VIDEO_TYPES.includes(contentType);

  // A profile photo is a still, never a clip.
  if (kind === "profile" && !isImage) {
    return {
      ok: false as const,
      error: "Profile photo must be a JPG, PNG, WebP or AVIF image.",
    };
  }
  if (!isImage && !isVideo) {
    return {
      ok: false as const,
      error: "Upload a JPG, PNG, WebP, AVIF, MP4, MOV or WebM file.",
    };
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    return { ok: false as const, error: "That file looks empty." };
  }
  if (contentLength > maxBytes) {
    return {
      ok: false as const,
      error: isImage ? "Keep images under 8MB." : "Keep videos under 200MB.",
    };
  }

  return { ok: true as const, isVideo, maxBytes };
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

/** Random key. The uploader's filename is never trusted or reused as a path. */
export function objectKey(kind: UploadKind, contentType: string) {
  return `${kind}/${crypto.randomUUID()}.${EXT_BY_TYPE[contentType] ?? "bin"}`;
}

/**
 * Presigned PUT URL (query-string auth).
 *
 * `content-type` is a signed header, so the browser must send exactly the type
 * it declared - R2 rejects a mismatch itself. Byte length is checked when the
 * form is submitted, via headObject below.
 */
export async function presignUpload(
  key: string,
  contentType: string,
  expiresIn = 300,
) {
  const { amzDate, datestamp } = timestamps();
  const credentialScope = `${datestamp}/${REGION}/${SERVICE}/aws4_request`;
  const canonicalUri = `/${R2_BUCKET()}/${encodeKey(key)}`;

  const query: Record<string, string> = {
    "X-Amz-Algorithm": ALGORITHM,
    // Mirrors what the AWS SDK emits. Harmless, and some S3-compatible
    // gateways expect it to be present on a presigned URL.
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
    "X-Amz-Credential": `${env("R2_ACCESS_KEY_ID")}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host",
  };

  const canonicalQuery = Object.keys(query)
    .sort()
    .map((k) => `${uriEncode(k)}=${uriEncode(query[k])}`)
    .join("&");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    `content-type:${contentType}\nhost:${host()}\n`,
    "content-type;host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    ALGORITHM,
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  const signature = hex(await hmac(await signingKey(datestamp), stringToSign));

  return `https://${host()}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** Signed request with an Authorization header, for server-to-R2 calls. */
async function signedFetch(method: "HEAD" | "DELETE", key: string) {
  const { amzDate, datestamp } = timestamps();
  const credentialScope = `${datestamp}/${REGION}/${SERVICE}/aws4_request`;
  const canonicalUri = `/${R2_BUCKET()}/${encodeKey(key)}`;
  const payloadHash = await sha256("");

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    `host:${host()}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`,
    "host;x-amz-content-sha256;x-amz-date",
    payloadHash,
  ].join("\n");

  const stringToSign = [
    ALGORITHM,
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  const signature = hex(await hmac(await signingKey(datestamp), stringToSign));

  return fetch(`https://${host()}${canonicalUri}`, {
    method,
    headers: {
      Authorization:
        `${ALGORITHM} Credential=${env("R2_ACCESS_KEY_ID")}/${credentialScope}, ` +
        `SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
  });
}

/**
 * Confirms an object really exists and what it actually is. A presigned PUT
 * pins the content type but not the byte count, so this is what stops someone
 * declaring a 1MB image and pushing a 2GB file into the bucket.
 */
export async function headObject(key: string) {
  const res = await signedFetch("HEAD", key);
  if (!res.ok) return null;
  return {
    size: Number(res.headers.get("content-length") ?? 0),
    contentType: res.headers.get("content-type") ?? "",
  };
}

export async function deleteObject(key: string) {
  await signedFetch("DELETE", key);
}
