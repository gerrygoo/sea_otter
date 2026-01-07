import { describe, it, expect } from 'vitest';
import { calculateCSSPace } from './css_utils';

describe('CSS Calculation', () => {
  it('should calculate CSS pace correctly', () => {
    // 400m: 6:00 (360s)
    // 200m: 2:50 (170s)
    // CSS Pace should be 95s (1:35/100m)
    const t400 = 360;
    const t200 = 170;
    const css = calculateCSSPace(t400, t200);
    expect(css).toBe(95);
  });

  it('should handle decimal times', () => {
     // 400m: 5:00.5 (300.5s)
     // 200m: 2:20.5 (140.5s)
     // Diff: 160s
     // Pace: 80s
     expect(calculateCSSPace(300.5, 140.5)).toBe(80);
  });
  
  it('should return null if t400 <= t200', () => {
      // Impossible physically for CSS calculation in this context
      expect(calculateCSSPace(100, 200)).toBeNull();
  });
});
