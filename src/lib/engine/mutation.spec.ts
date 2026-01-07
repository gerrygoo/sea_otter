import { describe, it, expect } from 'vitest';
import { mutateWorkout } from './mutation';
import { TrainingFocus, PoolSizeUnit, StrokeStyle, type Workout, type WorkoutParameters } from './types';

describe('mutateWorkout', () => {
  const defaultParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    totalTimeMinutes: 60,
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
    strokePreferences: {
      free: 5,
      back: 5,
      breast: 1,
      fly: 1,
      im: 1,
      drill: 5,
      kick: 5,
      pull: 5
    }
  };

  const baseWorkout: Workout = {
    warmup: [
      { reps: 1, distance: 200, stroke: StrokeStyle.Free, description: 'Warmup Free', intervalSeconds: 180 }
    ],
    preset: [],
    mainSet: [
      { reps: 4, distance: 100, stroke: StrokeStyle.Free, description: 'Main Set', intervalSeconds: 90 }
    ],
    cooldown: [],
    totalDistance: 600,
    estimatedDurationMinutes: 9,
    tags: ['Endurance']
  };

  it('should return a workout that is different from the original', () => {
    const mutated = mutateWorkout(baseWorkout, defaultParams);
    expect(JSON.stringify(mutated)).not.toEqual(JSON.stringify(baseWorkout));
  });

  it('should maintain the total distance (roughly) or validity', () => {
    const mutated = mutateWorkout(baseWorkout, defaultParams);
    expect(mutated.totalDistance).toBeGreaterThan(0);
    expect(mutated.mainSet.length).toBeGreaterThan(0);
  });
});
