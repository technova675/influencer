"use client";

/**
 * Catches errors thrown in the root layout itself, where app/error.tsx cannot
 * render. It must ship its own <html> and <body>, and cannot rely on the app's
 * fonts or CSS variables, so the styling here is deliberately self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f4f2",
          color: "#16161a",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#55555f", lineHeight: 1.6, margin: 0 }}>
            The application failed to start. Please try again.
          </p>
          {error.digest && (
            <p style={{ color: "#8c8c96", fontSize: "0.75rem", marginTop: "0.75rem" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.75rem 1.5rem",
              borderRadius: 999,
              border: "none",
              background: "#16161a",
              color: "#fff",
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
