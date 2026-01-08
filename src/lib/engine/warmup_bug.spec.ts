import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Warmup/Cooldown Mandatory Enforcement', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 45,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    strokePreferences: {
        [StrokeStyle.Free]: 3, [StrokeStyle.Back]: 3, [StrokeStyle.Breast]: 3, [StrokeStyle.Fly]: 3, [StrokeStyle.IM]: 3, [StrokeStyle.Drill]: 3, [StrokeStyle.Kick]: 3, [StrokeStyle.Pull]: 3
    },
    cssPace: 100 // 1:40/100m
  };

  it('should include warmup and cooldown for a 45-minute workout', () => {
    const workout = generateWorkout(baseParams);

    expect(workout.warmup.length).toBeGreaterThan(0);
    expect(workout.cooldown.length).toBeGreaterThan(0);
  });
  
  it('should include warmup and cooldown for a 40-minute workout', () => {
      const workout = generateWorkout({ ...baseParams, totalTimeMinutes: 40 });
      expect(workout.warmup.length).toBeGreaterThan(0);
      expect(workout.cooldown.length).toBeGreaterThan(0);
  });
});
