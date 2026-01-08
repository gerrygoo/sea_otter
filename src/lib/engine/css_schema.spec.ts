import { describe, it, expect } from 'vitest';
import { WorkoutParametersSchema } from './schema';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';

describe('CSS Parameters in Schema', () => {
  it('should validate valid CSS parameters', () => {
    const validData = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 60,
      availableGear: {
        fins: true,
        kickboard: true,
        pullBuoy: true,
        paddles: true,
        snorkel: true,
      },
      focus: TrainingFocus.Endurance,
      preferredStrokes: [StrokeStyle.Free],
      strokePreferences: {
        [StrokeStyle.Free]: 5,
        [StrokeStyle.Back]: 3,
        [StrokeStyle.Breast]: 3,
        [StrokeStyle.Fly]: 3,
        [StrokeStyle.IM]: 3,
        [StrokeStyle.Drill]: 3,
        [StrokeStyle.Kick]: 3,
        [StrokeStyle.Pull]: 3,
      },
      effortLevel: 7,
      cssPace: 90, // 1:30 per 100
    };

    const result = WorkoutParametersSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow cssPace to be optional', () => {
      const validDataWithoutCSS = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 60,
      availableGear: {
        fins: true,
        kickboard: true,
        pullBuoy: true,
        paddles: true,
        snorkel: true,
      },
      focus: TrainingFocus.Endurance,
      preferredStrokes: [StrokeStyle.Free],
      strokePreferences: {
        [StrokeStyle.Free]: 5,
        [StrokeStyle.Back]: 3,
        [StrokeStyle.Breast]: 3,
        [StrokeStyle.Fly]: 3,
        [StrokeStyle.IM]: 3,
        [StrokeStyle.Drill]: 3,
        [StrokeStyle.Kick]: 3,
        [StrokeStyle.Pull]: 3,
      },
      effortLevel: 7,
      // No cssPace
    };

    const result = WorkoutParametersSchema.safeParse(validDataWithoutCSS);
    expect(result.success).toBe(true);
  });

   it('should fail if cssPace is negative', () => {
      const invalidData = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 60,
      availableGear: {
        fins: true,
        kickboard: true,
        pullBuoy: true,
        paddles: true,
        snorkel: true,
      },
      focus: TrainingFocus.Endurance,
      preferredStrokes: [StrokeStyle.Free],
      strokePreferences: {
        [StrokeStyle.Free]: 5,
        [StrokeStyle.Back]: 3,
        [StrokeStyle.Breast]: 3,
        [StrokeStyle.Fly]: 3,
        [StrokeStyle.IM]: 3,
        [StrokeStyle.Drill]: 3,
        [StrokeStyle.Kick]: 3,
        [StrokeStyle.Pull]: 3,
      },
      effortLevel: 7,
      cssPace: -10,
    };

    const result = WorkoutParametersSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
