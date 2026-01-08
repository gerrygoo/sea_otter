import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus } from './types';
import type { WorkoutParameters } from './types';

describe('End-to-End Workout Generation Integration', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 45, // Changed from 60 to match test title context
    availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
    focus: TrainingFocus.Mixed,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should generate a complex, valid workout for a 45-minute mixed session', () => {
    const workout = generateWorkout(baseParams);

    expect(workout).not.toBeNull();
    expect(workout.totalDistance).toBeGreaterThan(1500); // 45 mins should be > 1500m
    expect(workout.estimatedDurationMinutes).toBeLessThanOrEqual(45 + 5);
    
    // Check for variety
    const descriptions = [
        ...workout.warmup,
        ...workout.mainSet,
        ...workout.cooldown
    ].map(s => s.description.toLowerCase());

    // Should contain a mix of different types
    expect(descriptions.some(d => d.includes('pyramid') || d.includes('ladder'))).toBe(true);
  });

  it('should handle extreme time constraints (very short workout)', () => {
    const shortWorkout = generateWorkout({
        ...baseParams,
        totalTimeMinutes: 10
    });

    expect(shortWorkout.estimatedDurationMinutes).toBeLessThanOrEqual(15);
    expect(shortWorkout.mainSet.length).toBeGreaterThan(0);
  });

  it('should utilize available time for long workouts (90 mins)', () => {
    const longWorkout = generateWorkout({
        ...baseParams,
        totalTimeMinutes: 90
    });

    // 90 mins @ 1:30/100m = ~6000m capacity.
    // We expect at least 70% utilization = 63 mins.
    expect(longWorkout.estimatedDurationMinutes).toBeGreaterThan(63);
    
    // Warmup should be substantial (e.g. >= 400m) due to slack utilization
    const warmupDist = longWorkout.warmup.reduce((a, s) => a + s.distance * s.reps, 0);
    expect(warmupDist).toBeGreaterThanOrEqual(400);
  });
});