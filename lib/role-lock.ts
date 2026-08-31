import "server-only";
import { adminClient } from "./supabase";
import { ROLE_LOCK_DAYS } from "./roles";
import { talentType, type TalentType } from "./taxonomy";

export type RoleLock =
  | { blocked: false; existing: null }
  | { blocked: false; existing: { id: string; talentType: TalentType; changedAt: string } }
  | {
      blocked: true;
      currentType: TalentType;
      currentLabel: string;
      unlocksAt: Date;
      daysLeft: number;
    };

const DAY = 24 * 60 * 60 * 1000;

/**
 * Whether this email may submit under `next`.
 *
 * Re-submitting under the role you already hold is always allowed - that is how
 * somebody updates their rates. Switching to a different role is refused until
 * ROLE_LOCK_DAYS have passed since the last time their role was set.
 *
 * Enforced here rather than in a database trigger on purpose: the agency has to
 * stay able to correct somebody's type by hand from the admin screen, and a
 * trigger could not tell that apart from a re-application.
 */
export async function checkRoleLock(
  email: string,
  next: TalentType,
): Promise<RoleLock> {
  const { data, error } = await adminClient()
    .from("creators")
    .select("id,talent_type,talent_type_changed_at")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  // A lookup failure must not swallow a genuine application. The unique
  // constraint on email still prevents a duplicate row either way.
  if (error || !data) return { blocked: false, existing: null };

  const row = data as {
    id: string;
    talent_type: TalentType;
    talent_type_changed_at: string | null;
  };

  if (row.talent_type === next) {
    return {
      blocked: false,
      existing: {
        id: row.id,
        talentType: row.talent_type,
        changedAt: row.talent_type_changed_at ?? new Date().toISOString(),
      },
    };
  }

  const since = row.talent_type_changed_at
    ? new Date(row.talent_type_changed_at)
    : null;
  const unlocksAt = since ? new Date(since.getTime() + ROLE_LOCK_DAYS * DAY) : null;

  if (unlocksAt && unlocksAt.getTime() > Date.now()) {
    return {
      blocked: true,
      currentType: row.talent_type,
      currentLabel: talentType(row.talent_type).label,
      unlocksAt,
      daysLeft: Math.max(1, Math.ceil((unlocksAt.getTime() - Date.now()) / DAY)),
    };
  }

  // The lock has expired and they are genuinely changing role, so the clock
  // restarts from this submission. Returning the old timestamp here would mean
  // the lock never resets and somebody could switch role every day afterwards.
  return {
    blocked: false,
    existing: {
      id: row.id,
      talentType: next,
      changedAt: new Date().toISOString(),
    },
  };
}

/** "13 May 2027" - the date somebody may change role, said plainly. */
export function formatLockDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
