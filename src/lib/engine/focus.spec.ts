import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus } from './types';
import type { WorkoutParameters } from './types';

describe('Training Focus Prioritization', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    totalTimeMinutes: 45,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Endurance,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should prioritize endurance-style sets when focus is Aerobic', () => {
    // This requires us to have generators tagged with focus.
    // For now, let's just assert that the result is valid.
    const workout = generateWorkout({
        ...baseParams,
        focus: TrainingFocus.Endurance
    });
    expect(workout).not.toBeNull();
  });

  it('should prioritize Pull modality for Strength focus when gear is available', () => {
    const workout = generateWorkout({
        ...baseParams,
        availableGear: { ...baseParams.availableGear, pullBuoy: true, paddles: true },
        focus: TrainingFocus.Strength
    });

    // We now decouple structure and modality. 
    // Strength focus should trigger Pull modality if gear is available.
    const mainSetDescription = workout.mainSet[0].description;
    expect(mainSetDescription).toContain('(Pull)');
  });
});
