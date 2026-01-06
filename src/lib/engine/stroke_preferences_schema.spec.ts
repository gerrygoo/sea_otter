import { describe, it, expect } from 'vitest';
import { WorkoutParametersSchema } from './schema';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';

describe('Stroke Preferences Schema', () => {
  it('should validate WorkoutParameters with strokePreferences', () => {
    const validParams = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 60,
      availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Aerobic,
      preferredStrokes: [], // deprecated but still there
      strokePreferences: {
        [StrokeStyle.Free]: 3,
        [StrokeStyle.Back]: 3,
        [StrokeStyle.Breast]: 3,
        [StrokeStyle.Fly]: 3,
        [StrokeStyle.IM]: 3,
        [StrokeStyle.Drill]: 3,
        [StrokeStyle.Kick]: 3,
        [StrokeStyle.Pull]: 3,
      },
      effortLevel: 5
    };

    const result = WorkoutParametersSchema.safeParse(validParams);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.strokePreferences).toBeDefined();
      expect(result.data.strokePreferences[StrokeStyle.Free]).toBe(3);
    }
  });

  it('should fail if strokePreferences is missing', () => {
    const invalidParams = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 60,
      availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Aerobic,
      preferredStrokes: [],
      effortLevel: 5
    };

    const result = WorkoutParametersSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });
});
