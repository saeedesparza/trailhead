import type { SetEntry } from './model';

/** Epley estimate of one-rep max. A single is its own 1RM. */
export const e1rm = (s: SetEntry): number => (s.r <= 0 ? 0 : s.r === 1 ? s.w : s.w * (1 + s.r / 30));

/** The set with the highest est. 1RM, or null for no sets. */
export function bestSet(sets: readonly SetEntry[]): SetEntry | null {
  let best: SetEntry | null = null;
  for (const s of sets) if (!best || e1rm(s) > e1rm(best)) best = s;
  return best;
}

/** Exercise names are matched case- and whitespace-insensitively. */
export const keyOf = (name: string): string => name.trim().toLowerCase();
