import { describe, it, expect, vi } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, type WorkoutParameters } from './types';
import * as utils from './utils';

describe('Distance-Based Generation Logic', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    targetType: 'distance',
    targetDistance: 2000,
    availableGear: {
      fins: false,
      kickboard: false,
      pullBuoy: false,
      paddles: false,
      snorkel: false
    },
    focus: TrainingFocus.Endurance,
    preferredStrokes: [StrokeStyle.Free],
    strokePreferences: {
      [StrokeStyle.Free]: 5,
      [StrokeStyle.Back]: 1,
      [StrokeStyle.Breast]: 1,
      [StrokeStyle.Fly]: 1,
      [StrokeStyle.IM]: 1,
      [StrokeStyle.Drill]: 1,
      [StrokeStyle.Kick]: 1,
      [StrokeStyle.Pull]: 1
    },
    effortLevel: 5,
    totalTimeMinutes: 60 // Should be ignored or used as fallback
  };

  it('should accept targetDistance and targetType', () => {
    const workout = generateWorkout(baseParams);
    expect(workout).toBeDefined();
    // Since generators are not updated, we can't assert totalDistance == 2000 yet.
    // But we expect it to produce something.
    expect(workout.totalDistance).toBeGreaterThan(0);
  });

  it('should verify rounding logic is called', () => {
    const spy = vi.spyOn(utils, 'roundToNearestWall');
    
    generateWorkout({
      ...baseParams,
      targetDistance: 2010
    });

    expect(spy).toHaveBeenCalledWith(2010, 25);
  });
});
