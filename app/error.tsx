"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="ground-1 grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="overline">Something broke</p>
        <h1 className="display-sm mt-4 text-3xl">
          That didn&rsquo;t load properly.
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          The page hit an error on our side. Try again, and if it keeps
          happening let us know.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-faint">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back to the roster
          </Link>
        </div>
      </div>
    </main>
  );
}
