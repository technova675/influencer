"use client";

import { useCallback, useRef, useState } from "react";
import {
  IMAGE_TYPES,
  MAX_SHOWCASE_FILES,
  VIDEO_TYPES,
  humanSize,
  isVideoKey,
} from "@/lib/media";

type Uploaded = { key: string; url: string | null; name: string; size: number };

/** Presign, then PUT the bytes straight to R2 with progress. */
function putWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    // Must match the signed ContentType exactly or R2 rejects the request.
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () =>
      reject(
        new Error(
          "Upload failed. If this persists, the R2 bucket likely needs CORS configured.",
        ),
      );
    xhr.send(file);
  });
}

async function uploadOne(
  file: File,
  kind: "profile" | "showcase",
  onProgress: (pct: number) => void,
): Promise<Uploaded> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
      contentLength: file.size,
      kind,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not start the upload.");

  await putWithProgress(data.uploadUrl, file, onProgress);
  return { key: data.key, url: data.publicUrl, name: file.name, size: file.size };
}

/* ------------------------------------------------------------ profile photo */

export function ProfilePhotoUpload({ error }: { error?: string }) {
  const [file, setFile] = useState<Uploaded | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(async (picked: File | undefined) => {
    if (!picked) return;
    setErr(null);
    setPct(0);
    try {
      setFile(await uploadOne(picked, "profile", setPct));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
      setFile(null);
    } finally {
      setPct(null);
    }
  }, []);

  const shown = err ?? error;

  return (
    <div>
      {/* The form submits the R2 key, never the bytes. */}
      <input type="hidden" name="profile_photo_path" value={file?.key ?? ""} />

      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-black/5">
          {file?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-faint" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                d="M12 13a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"
              />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pct !== null}
            className="btn btn-ghost !py-2 !text-sm disabled:opacity-60"
          >
            {pct !== null
              ? `Uploading ${pct}%`
              : file
                ? "Replace photo"
                : "Choose an image"}
          </button>
          {file && pct === null && (
            <p className="mt-1.5 truncate text-xs text-ink-faint">
              {file.name} · {humanSize(file.size)}
            </p>
          )}
          {pct !== null && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handle(e.target.files?.[0])}
      />

      {shown && (
        <p role="alert" className="mt-1.5 text-xs text-[#c0392b]">
          {shown}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- showcase media */

export function ShowcaseUpload() {
  const [files, setFiles] = useState<Uploaded[]>([]);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (picked: FileList | null) => {
      if (!picked?.length) return;
      setErr(null);

      const room = MAX_SHOWCASE_FILES - files.length;
      if (room <= 0) {
        setErr(`You can upload up to ${MAX_SHOWCASE_FILES} files.`);
        return;
      }

      for (const file of Array.from(picked).slice(0, room)) {
        setPct(0);
        try {
          const done = await uploadOne(file, "showcase", setPct);
          setFiles((prev) => [...prev, done]);
        } catch (e) {
          setErr(e instanceof Error ? e.message : "Upload failed.");
          break;
        } finally {
          setPct(null);
        }
      }
    },
    [files.length],
  );

  return (
    <div>
      {files.map((f) => (
        <input key={f.key} type="hidden" name="showcase_media_paths" value={f.key} />
      ))}

      {files.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {files.map((f) => (
            <li key={f.key} className="group relative">
              <div className="aspect-square overflow-hidden rounded-[var(--radius)] bg-black/5 ring-1 ring-black/5">
                {isVideoKey(f.key) ? (
                  <div className="grid h-full place-items-center">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-ink-faint" aria-hidden>
                      <path fill="currentColor" d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : f.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((p) => p.filter((x) => x.key !== f.key))}
                className="absolute -top-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pct !== null || files.length >= MAX_SHOWCASE_FILES}
        className="btn btn-ghost !py-2 !text-sm disabled:opacity-60"
      >
        {pct !== null
          ? `Uploading ${pct}%`
          : files.length >= MAX_SHOWCASE_FILES
            ? "Maximum reached"
            : "Add photos or video"}
      </button>

      {pct !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-accent transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />

      {err && (
        <p role="alert" className="mt-1.5 text-xs text-[#c0392b]">
          {err}
        </p>
      )}
    </div>
  );
}
