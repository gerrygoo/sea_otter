import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Stroke Weighting (2-5)', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Mixed,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
      [StrokeStyle.Free]: 3,
      [StrokeStyle.Back]: 3,
      [StrokeStyle.Breast]: 3,
      [StrokeStyle.Fly]: 3,
      [StrokeStyle.IM]: 3,
      [StrokeStyle.Drill]: 3,
      [StrokeStyle.Kick]: 3,
      [StrokeStyle.Pull]: 3,
    }
  };

  it('should favor strokes with higher preference values', () => {
    const params = {
      ...baseParams,
      strokePreferences: {
        ...baseParams.strokePreferences,
        [StrokeStyle.Free]: 5 as const, // Primary Focus
        [StrokeStyle.Back]: 2 as const, // Rarely
        [StrokeStyle.Breast]: 1 as const,
        [StrokeStyle.Fly]: 1 as const,
        [StrokeStyle.IM]: 1 as const,
        [StrokeStyle.Drill]: 1 as const,
        [StrokeStyle.Kick]: 1 as const,
        [StrokeStyle.Pull]: 1 as const,
      }
    };

    let freeCount = 0;
    let backCount = 0;
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      const workout = generateWorkout(params);
      const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
      
      allSets.forEach(s => {
        if (s.stroke === StrokeStyle.Free) freeCount++;
        if (s.stroke === StrokeStyle.Back) backCount++;
      });
    }

    // Free (5) should be significantly more frequent than Back (2)
    // Weight ratio is 5:2, so Free should appear more than 2x as much as Back.
    expect(freeCount).toBeGreaterThan(backCount);
    expect(freeCount).toBeGreaterThan(0);
  });
});
