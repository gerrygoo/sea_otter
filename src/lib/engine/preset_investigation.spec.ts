import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, type WorkoutParameters } from './types';

describe('Pre-set Investigation', () => {
  it('should confirm that preset is always empty in current engine', () => {
    const params: WorkoutParameters = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Meters,
      totalTimeMinutes: 60,
      availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
      focus: TrainingFocus.Mixed,
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

    const workout = generateWorkout(params);
    expect(workout.preset).toHaveLength(0);
  });
});
