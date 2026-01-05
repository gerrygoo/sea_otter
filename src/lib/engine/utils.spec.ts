import { describe, it, expect } from 'vitest';
import { metersToYards, yardsToMeters, roundToNearest, estimateDistanceDuration } from './utils';

describe('Engine Utilities', () => {
  describe('Conversions', () => {
    it('should convert yards to meters correctly', () => {
      // 100 yards is approx 91.44 meters
      expect(yardsToMeters(100)).toBeCloseTo(91.44, 2);
    });

    it('should convert meters to yards correctly', () => {
      // 100 meters is approx 109.36 yards
      expect(metersToYards(100)).toBeCloseTo(109.36, 2);
    });
  });

  describe('Rounding', () => {
    it('should round distance to nearest 25 (default pool multiple)', () => {
      expect(roundToNearest(95, 25)).toBe(100);
      expect(roundToNearest(80, 25)).toBe(75);
      expect(roundToNearest(110, 25)).toBe(100); // Or 125, depending on implementation. Math.round(110/25)*25 = 4*25 = 100
    });
  });
  
  describe('Duration Estimation', () => {
      it('should calculate duration correctly given distance and pace', () => {
          // 200 yards at 1:30/100 pace
          // 2 * 90 = 180 seconds
          expect(estimateDistanceDuration(200, 90)).toBe(180);
      });
  });
});
