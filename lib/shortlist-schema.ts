import { z } from "zod";
import { CITIES, GENRES, TALENT_TYPE_IDS } from "./taxonomy";

/**
 * The landing page's inline shortlist request.
 *
 * Six fields, three of them required. That ceiling is the design, not a first
 * pass: the bar sits in a single row on the landing page and every field has
 * to be answerable off the top of someone's head. Anything that needs a
 * document open - budget breakdowns, deliverable counts, usage terms - is a
 * conversation for after we reply, not a reason to abandon the form.
 */

/** "" -> undefined, so an untouched optional field is stored as NULL. */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/** An optional select: blank, or one of the listed options. */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(blankToUndefined, z.enum(values).optional());

export const shortlistRequestSchema = z.object({
  talent_type: z.enum(TALENT_TYPE_IDS, {
    message: "Pick who you're looking for",
  }),
  genre: optionalEnum(GENRES),
  city: optionalEnum(CITIES),

  full_name: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(120, "That name is too long"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a working email")
    .max(200),

  contact_handle: z.preprocess(
    blankToUndefined,
    z.string().trim().max(160).optional(),
  ),

  note: z.preprocess(
    blankToUndefined,
    z.string().trim().max(1000).optional(),
  ),

  /* Honeypot. A real person never sees this field, so anything in it is a bot.
     Named `website` to look worth filling in. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ShortlistRequest = z.infer<typeof shortlistRequestSchema>;

/** FormData -> plain object. No multi-value fields on this form. */
export function shortlistFormToObject(fd: FormData) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    out[key] = fd.get(key) ?? "";
  }
  return out;
}
