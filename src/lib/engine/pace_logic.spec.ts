import { describe, it, expect } from 'vitest';
import { getDescendingTargetTimes } from './pace_logic';

describe('Pace Logic - Descending', () => {
  it('should calculate descending target times correctly', () => {
    const cssPace = 100; // 1:40/100m
    const distance = 100;
    const reps = 4;
    const decrement = 5; // 5s per rep

    // Start pace: Neutral/Normal (CSS + 1) = 101? 
    // Or we should specify the start intensity. 
    // Usually descending sets are described as "1-4 descending" starting at a specific zone.
    // Let's assume start pace is provided or derived.
    
    // For the helper, let's just use a base pace.
    const basePace = 110; 
    const times = getDescendingTargetTimes(basePace, distance, reps, decrement);

    expect(times).toHaveLength(4);
    expect(times[0]).toBe(110);
    expect(times[1]).toBe(105);
    expect(times[2]).toBe(100);
    expect(times[3]).toBe(95);
  });
});
