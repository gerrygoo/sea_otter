import { describe, it, expect } from 'vitest';
import { generateWorkoutOptions } from './index';
import { TrainingFocus, PoolSizeUnit, StrokeStyle, type WorkoutParameters } from './types';

describe('generateWorkoutOptions', () => {
  const defaultParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    totalTimeMinutes: 60,
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    availableGear: [],
    strokePreferences: {
      free: 5,
      back: 3,
      breast: 3,
      fly: 1,
      im: 1
    }
  };

  it('should return the requested number of workouts', () => {
    const options = generateWorkoutOptions(defaultParams, 3);
    expect(options).toHaveLength(3);
  });

  it('should ensure generated options are not identical', () => {
    const options = generateWorkoutOptions(defaultParams, 3);
    const uniqueDescriptions = new Set(
        options.map(w => JSON.stringify(w.mainSet.map(s => s.description)))
    );
    // We expect at least 2 different workouts out of 3, ideally 3.
    expect(uniqueDescriptions.size).toBeGreaterThanOrEqual(2);
  });
});

import { generateSimilar } from './index';

describe('generateSimilar', () => {
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
    warmup: [],
    preset: [],
    mainSet: [
      { reps: 4, distance: 100, stroke: StrokeStyle.Free, description: '4 x 100 Free', intervalSeconds: 90 }
    ],
    cooldown: [],
    totalDistance: 400,
    estimatedDurationMinutes: 6,
    tags: ['Endurance']
  };

  it('should return requested number of similar workouts', () => {
    const similar = generateSimilar(baseWorkout, defaultParams, 2);
    expect(similar).toHaveLength(2);
    expect(similar[0]).not.toEqual(baseWorkout);
  });
});
