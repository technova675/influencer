import type { NextConfig } from "next";

/**
 * Extra origins allowed to post a Server Action.
 *
 * Next compares a Server Action's `Origin` against its `Host` /
 * `X-Forwarded-Host` and rejects a mismatch, which is what stops another site
 * posting to ours. A tunnel breaks that check honestly rather than maliciously.
 * Reached through a VS Code dev tunnel or ngrok the two headers describe
 * different things - the browser reports the localhost origin it was handed
 * while the tunnel rewrites the forwarded host to its own domain - so every
 * action (choosing a role, clearing one, submitting the join form) aborts with
 * a 500 and the page appears to hang on the POST.
 *
 * Note the direction: this list extends the **origin** side, so the value is
 * the origin the browser reports, not the tunnel's hostname. Getting that
 * backwards silently changes nothing, because the rejected origin still is not
 * on the list. For the usual VS Code port-forwarding setup that means the
 * localhost origin:
 *
 *   ACTION_ORIGINS=localhost:3200 npm run dev
 *
 * If instead you load the tunnel URL directly in the browser, the origin is the
 * tunnel host and that is what belongs here. Comma-separate to allow both.
 * A `*.example.com` wildcard is supported but deliberately not used by default:
 * `*.devtunnels.ms` would trust every tunnel anybody runs.
 *
 * Not gated on NODE_ENV - sharing a `next start` preview through a tunnel is as
 * ordinary as sharing a dev server, and a second hidden condition would
 * reintroduce the same silent 500 this exists to fix. The gate is the variable
 * itself: unset, the list is empty and the origin check applies exactly as
 * before.
 */
const actionOrigins = (process.env.ACTION_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim().replace(/^https?:\/\//, "").replace(/\/+$/, ""))
  .filter(Boolean);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: actionOrigins },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Do not let the site be framed - clickjacking on /admin especially.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The agency surface should never be cached or indexed.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
