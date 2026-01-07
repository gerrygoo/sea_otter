import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';

describe('Engine Integration with CSS', () => {
  const baseParams = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: {
      fins: false,
      kickboard: false,
      pullBuoy: false,
      paddles: false,
      snorkel: false
    },
    focus: TrainingFocus.Aerobic,
    preferredStrokes: [],
    strokePreferences: {
      [StrokeStyle.Free]: 3,
      [StrokeStyle.Back]: 3,
      [StrokeStyle.Breast]: 3,
      [StrokeStyle.Fly]: 3,
      [StrokeStyle.IM]: 3,
      [StrokeStyle.Drill]: 3,
      [StrokeStyle.Kick]: 3,
      [StrokeStyle.Pull]: 3
    },
    effortLevel: 5
  };

  it('should generate targetPacePer100 for sets when cssPace is provided', () => {
    const params = { ...baseParams, cssPace: 100 }; // 1:40/100m
    const workout = generateWorkout(params);

    // Check main set - Hard (CSS - 5)
    expect(workout.mainSet.length).toBeGreaterThan(0);
    expect(workout.mainSet[0].targetPacePer100).toBe(95);
    
    // Check warmup - Easy (CSS + 10)
    if (workout.warmup.length > 0) {
        expect(workout.warmup[0].targetPacePer100).toBe(110);
    }

    // Check preset - Neutral (CSS)
    if (workout.preset.length > 0) {
        expect(workout.preset[0].targetPacePer100).toBe(100);
    }
  });
});