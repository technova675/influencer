# Creator Roster

A creator roster that collects influencer profiles into one Supabase database and
lets the agency filter it against a client brief.

Three surfaces:

| Route | Who it's for | What it does |
| --- | --- | --- |
| `/` | Brands | Landing page. Pulls live counts from the roster. |
| `/join` | Creators | The submission form. Writes straight to Supabase. |
| `/roster` | Brands | Approved creators only, filterable by genre, tier, city, language, budget. |
| `/admin` | The agency | Review queue, approve/reject, internal notes, CSV export. Password protected. |

---

## Setup

### 1. Create the database tables

Open **Supabase Dashboard → SQL Editor → New query**, paste the whole of
[`supabase/schema.sql`](supabase/schema.sql), and hit **Run**.

This creates the `creators` table, its indexes, the search trigger and the Row
Level Security policies. It is safe to re-run. There is no storage bucket to
create — media lives in Cloudflare R2 (next step).

### 2. Cloudflare R2 (media)

Profile photos and showcase video/images live in R2, not in Supabase.

1. **Create a bucket** (R2 -> Create bucket). Put its name in `R2_BUCKET`.
2. **Create an API token** (R2 -> Manage API Tokens -> Object Read & Write,
   scoped to that bucket). Copy the Access Key ID and Secret Access Key.
3. **Turn on public access** so the roster can display the files: bucket ->
   Settings -> Public Development URL, or connect a custom domain. Put that
   origin in `NEXT_PUBLIC_R2_PUBLIC_URL` with **no trailing slash**.
4. **Add CORS**, or browser uploads fail. Bucket -> Settings -> CORS Policy,
   paste [`r2-cors.json`](r2-cors.json) and change the production origin to
   your real domain.

Without step 4 uploads fail with a network error and no useful message - it is
the single most common thing to get wrong.

### 3. Environment

`.env.local` already holds the Supabase keys. The admin password was generated
during setup — find it in `.env.local` under `ADMIN_PASSWORD`.

```
NEXT_PUBLIC_SUPABASE_URL         your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    publishable key - safe in the browser
SUPABASE_SERVICE_ROLE_KEY        secret key - server only, bypasses RLS
ADMIN_PASSWORD                   password for /admin
ADMIN_SESSION_SECRET             signs the admin session cookie
R2_ACCOUNT_ID                    Cloudflare account id
R2_ACCESS_KEY_ID                 R2 API token key
R2_SECRET_ACCESS_KEY             R2 API token secret
R2_BUCKET                        bucket name
NEXT_PUBLIC_R2_PUBLIC_URL        public origin that serves the files
```

### 4. Run it

```bash
npm run dev     # http://localhost:3200
```

---

## How the data model works

**Self-reported and verified figures are separate columns.** What a creator types
goes in `instagram_followers`; what an official API later confirms goes in
`verified_instagram_followers`. A generated column, `effective_followers`, reads
the verified number when it exists and falls back to the self-reported one, and
every filter sorts on that.

This matters because self-reported follower counts are inflated as a matter of
routine. Keeping the two apart means you can bolt on a real Instagram or YouTube
API sync later and fill the verified side without a migration — and until then,
`is_verified` tells a client which numbers have actually been checked.

`effective_followers` also drives the tier (nano / micro / mid / macro / mega),
so a tier can never drift out of sync with the follower count.

## How media works

The browser uploads **straight to R2**, never through the server:

1. The form asks `POST /api/upload` for a presigned `PUT`, sending only the
   content type and byte length.
2. The route validates both, mints a random object key and returns a URL that
   is valid for 5 minutes.
3. The browser `PUT`s the file to R2 with a progress bar.
4. The form submits only the **object key**. On submit the server `HEAD`s each
   key to confirm what actually landed, and silently drops anything missing or
   oversized rather than failing the whole submission.

Routing a 200MB video through a Server Action would hit its body size limit, so
the bytes bypass the server entirely.

Only the key is stored, never a full URL, so moving buckets or putting a custom
domain in front is a config change rather than a data migration.

R2 requests are signed with AWS SigV4 implemented directly on Web Crypto rather
than via `@aws-sdk`. Two reasons: the SDK is very large, and Next externalises
it by symlinking into `.next/node_modules`, which cannot work on a filesystem
without junction support - this project sits on an exFAT drive. The signer was
verified to produce byte-identical signatures to the AWS SDK for the same input.

## Security model

- The **anon key can only INSERT** into `creators`. It cannot read the roster
  back. The roster is the agency's asset, so every read runs server-side with the
  service role key.
- `/api/upload` is necessarily public, so it is rate limited (12 presigns per
  IP per minute), the object key is random rather than the uploader's filename,
  and the content type is part of the signature - a URL issued for a JPEG
  cannot be reused to push something else.
- The **service role key never reaches the browser.** `lib/queries.ts` is marked
  `server-only`, which turns an accidental client import into a build error.
- `/admin` is behind an HMAC-signed, httpOnly session cookie. Every Server Action
  re-checks the session, because Server Actions are reachable by direct POST and
  not only through the UI.
- The join form carries an off-screen honeypot field and records submitter IP and
  user agent.
- CSV export escapes leading `=`, `+`, `-` and `@` so a creator cannot inject a
  formula into a spreadsheet the agency opens.

## Things worth knowing

- **Re-submitting the form with the same email updates that profile** rather than
  creating a duplicate (`upsert` on a unique lowercased email index).
- **Nothing is public until approved.** New submissions land as `pending` and only
  `approved` / `featured` appear on `/roster`.
- **Scroll reveals use an IntersectionObserver, not CSS `animation-timeline`.**
  A section at the bottom of the document can never finish a scroll-driven
  `entry` range, which strands its copy at opacity 0 permanently. Content is
  visible by default and only hidden once JS confirms it can reveal it again.

## Not built yet

- Email notification on new submissions (`RESEND_API_KEY` is stubbed in `.env.local`).
- Video thumbnails. Showcase clips currently show a play icon rather than a poster frame.
- Deleting a creator does not yet remove their objects from R2.
- A shareable client-facing media kit link for a saved shortlist.
- Real platform API verification — `Mark figures verified` in `/admin` currently
  promotes the self-reported numbers, as a placeholder for that sync.
