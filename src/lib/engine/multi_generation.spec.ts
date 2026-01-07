import { describe, it, expect } from 'vitest';
import { generateWorkoutOptions } from './index';
import { TrainingFocus, PoolSizeUnit, type WorkoutParameters } from './types';

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
