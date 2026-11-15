// Data types and validation. Pure: no DOM, no storage, no network.
// v1 is the Artifact 2 app's localStorage/export shape (key `trailhead.v1`).
// v2 adds per-workout sync fields. See PLAN.md "Sync rule".

export type Unit = 'lb' | 'kg';

export interface SetEntry {
  w: number; // weight
  r: number; // reps
}

export interface Exercise {
  name: string;
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  date: string; // ISO timestamp
  finished: boolean;
  notes: string;
  exercises: Exercise[];
  updatedAt: string; // ISO timestamp, last write wins
  deleted: boolean; // tombstone, never hard-delete
}

export interface LogData {
  version: 2;
  unit: Unit;
  workouts: Workout[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function parseExercise(raw: unknown): Exercise {
  const ex = isObj(raw) ? raw : {};
  const sets = Array.isArray(ex.sets) ? ex.sets : [];
  return {
    name: String(ex.name ?? '').trim() || 'Unnamed',
    sets: sets.map((s) => {
      const set = isObj(s) ? s : {};
      return {
        w: Number(set.w) || 0,
        r: Math.max(0, Math.round(Number(set.r) || 0)),
      };
    }),
  };
}

function parseWorkout(raw: unknown, now: string): Workout {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.date !== 'string' || !Array.isArray(raw.exercises)) {
    throw new Error('Malformed workout');
  }
  return {
    id: raw.id,
    date: raw.date,
    finished: Boolean(raw.finished),
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    exercises: raw.exercises.map(parseExercise),
    // v1 has no sync fields: treat an imported workout as last edited now.
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    deleted: raw.deleted === true,
  };
}

/**
 * Validate v1 (Artifact 2 export) or v2 data and return v2.
 * Throws on anything that doesn't look like our data. Same rules as the Artifact 2 `validate()`.
 */
export function parseLogData(data: unknown, now: string = new Date().toISOString()): LogData {
  if (!isObj(data) || !Array.isArray(data.workouts)) throw new Error('Missing "workouts" list');
  return {
    version: 2,
    unit: data.unit === 'kg' ? 'kg' : 'lb',
    workouts: data.workouts.map((w) => parseWorkout(w, now)),
  };
}
