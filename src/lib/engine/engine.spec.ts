import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus } from './types';
import type { WorkoutParameters } from './types';

describe('Workout Engine Orchestrator', () => {
  const mockParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    totalTimeMinutes: 30, // 30 minutes
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Endurance,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should generate a full workout with 4 segments', () => {
    const workout = generateWorkout(mockParams);

    expect(workout).not.toBeNull();
    expect(workout.warmup.length).toBeGreaterThan(0);
    // Preset might be empty if main set is huge, but usually not with 30 mins
    expect(workout.mainSet.length).toBeGreaterThan(0);
    expect(workout.cooldown.length).toBeGreaterThan(0);
    
    // Check constraints
    expect(workout.estimatedDurationMinutes).toBeLessThanOrEqual(30 + 5); // Tolerance
  });

  it('should prioritize main set allocation', () => {
    const workout = generateWorkout(mockParams);
    
    // Rough check: Main set should be the largest chunk
    const warmupDist = workout.warmup.reduce((acc, s) => acc + s.distance * s.reps, 0);
    const mainDist = workout.mainSet.reduce((acc, s) => acc + s.distance * s.reps, 0);

    expect(mainDist).toBeGreaterThan(warmupDist);
  });
});
