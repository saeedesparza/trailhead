import { describe, expect, it } from 'vitest';
import { bestSet, e1rm, keyOf } from './stats';

describe('stats', () => {
  it('e1rm uses Epley, singles are their own max, zero reps is zero', () => {
    expect(e1rm({ w: 100, r: 1 })).toBe(100);
    expect(e1rm({ w: 150, r: 5 })).toBeCloseTo(175);
    expect(e1rm({ w: 200, r: 0 })).toBe(0);
  });

  it('bestSet picks highest est. 1RM, not heaviest weight', () => {
    expect(bestSet([{ w: 200, r: 1 }, { w: 180, r: 5 }])).toEqual({ w: 180, r: 5 });
    expect(bestSet([])).toBeNull();
  });

  it('keyOf ignores case and spacing', () => {
    expect(keyOf('  Bench Press ')).toBe(keyOf('bench press'));
  });
});
