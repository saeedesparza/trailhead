import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseLogData } from './model';

const NOW = '2026-11-15T12:00:00.000Z';

describe('parseLogData', () => {
  it('upgrades a v1 export and adds sync fields', () => {
    const v1 = {
      version: 1,
      unit: 'lb',
      workouts: [{ id: 'a', date: '2026-10-01T17:00:00Z', finished: true, notes: 'ok', exercises: [{ name: ' Bench ', sets: [{ w: '135', r: 5.4 }] }] }],
    };
    const out = parseLogData(v1, NOW);
    expect(out.version).toBe(2);
    expect(out.workouts[0]).toEqual({
      id: 'a', date: '2026-10-01T17:00:00Z', finished: true, notes: 'ok',
      exercises: [{ name: 'Bench', sets: [{ w: 135, r: 5 }] }],
      updatedAt: NOW, deleted: false,
    });
  });

  it('keeps existing v2 sync fields', () => {
    const out = parseLogData({ unit: 'kg', workouts: [{ id: 'b', date: 'd', exercises: [], updatedAt: 'u', deleted: true }] }, NOW);
    expect(out.unit).toBe('kg');
    expect(out.workouts[0]).toMatchObject({ updatedAt: 'u', deleted: true, finished: false, notes: '' });
  });

  it('cleans bad sets the same way Artifact 2 did', () => {
    const out = parseLogData({ workouts: [{ id: 'c', date: 'd', exercises: [{ sets: [{ w: 'x', r: -3 }], name: '' }] }] }, NOW);
    expect(out.workouts[0]?.exercises[0]).toEqual({ name: 'Unnamed', sets: [{ w: 0, r: 0 }] });
  });

  it.each([null, {}, { workouts: 'no' }, { workouts: [{ id: 1 }] }])('rejects %j', (bad) => {
    expect(() => parseLogData(bad, NOW)).toThrow();
  });

  // Copied from trailhead-gym-log/coach/sample-export.json: 3 weeks of v1 data.
  const sample = new URL('./fixtures/v1-sample-export.json', import.meta.url);
  it('imports the Artifact 2/3 sample export', () => {
    const out = parseLogData(JSON.parse(readFileSync(sample, 'utf8')), NOW);
    expect(out.workouts.length).toBeGreaterThan(0);
    expect(out.workouts.every((w) => w.exercises.every((e) => e.sets.every((s) => s.r >= 0)))).toBe(true);
  });
});
