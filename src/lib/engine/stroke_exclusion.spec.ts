import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Stroke Exclusion (Never)', () => {
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

  it('should NOT include a stroke set to Never (1)', () => {
    const params = {
      ...baseParams,
      strokePreferences: {
        ...baseParams.strokePreferences,
        [StrokeStyle.Free]: 1 as const, // Exclude Freestyle
        [StrokeStyle.Back]: 5 as const,
        [StrokeStyle.Breast]: 5 as const,
        [StrokeStyle.Fly]: 5 as const,
        [StrokeStyle.IM]: 5 as const,
      }
    };

    const workout = generateWorkout(params);
    const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
    
    const freeSets = allSets.filter(s => s.stroke === StrokeStyle.Free);
    expect(freeSets).toHaveLength(0);
  });
});
