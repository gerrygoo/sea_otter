import { describe, it, expect } from 'vitest';
import { metersToYards, yardsToMeters, roundToNearest, estimateDistanceDuration, getAvailableStrokes, pickStroke } from './utils';
import { StrokeStyle } from './types';
import type { StrokePreferences } from './types';

describe('Engine Utilities', () => {
  const mockPrefs: StrokePreferences = {
    [StrokeStyle.Free]: 3,
    [StrokeStyle.Back]: 3,
    [StrokeStyle.Breast]: 3,
    [StrokeStyle.Fly]: 3,
    [StrokeStyle.IM]: 3,
    [StrokeStyle.Drill]: 3,
    [StrokeStyle.Kick]: 3,
    [StrokeStyle.Pull]: 3,
  };

  describe('Stroke Selection Utilities', () => {
    it('getAvailableStrokes should filter out Never (1)', () => {
      const prefs = { ...mockPrefs, [StrokeStyle.Fly]: 1, [StrokeStyle.Back]: 1 };
      const available = getAvailableStrokes(prefs as unknown as StrokePreferences);
      expect(available).not.toContain(StrokeStyle.Fly);
      expect(available).not.toContain(StrokeStyle.Back);
      expect(available).toContain(StrokeStyle.Free);
    });

    it('getAvailableStrokes should fallback to Freestyle if all are Never', () => {
      const allNever = { ...mockPrefs };
      Object.keys(allNever).forEach(k => allNever[k as keyof typeof allNever] = 1 as any);
      const available = getAvailableStrokes(allNever as unknown as StrokePreferences);
      expect(available).toEqual([StrokeStyle.Free]);
    });

    it('pickStroke should return the only available stroke', () => {
      const available = [StrokeStyle.Breast];
      const picked = pickStroke(mockPrefs, available);
      expect(picked).toBe(StrokeStyle.Breast);
    });
  });

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
