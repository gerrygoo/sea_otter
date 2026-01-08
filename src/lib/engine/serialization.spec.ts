import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { WorkoutSchema, SavedWorkoutSchema } from './schema';
import { PoolSizeUnit, TrainingFocus } from './types';

describe('Serialization & Validation', () => {
  it('should generate a workout that matches the Zod schema', () => {
    const workout = generateWorkout({
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 30,
      availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Endurance,
      preferredStrokes: [],
      effortLevel: 5,
      strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
      }
    });

    // Validate using Zod
    const result = WorkoutSchema.safeParse(workout);
    
    if (!result.success) {
        console.error(result.error);
    }
    
    expect(result.success).toBe(true);
  });

  it('should validate a SavedWorkout object', () => {
    const workout = generateWorkout({
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 30,
      availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Endurance,
      preferredStrokes: [],
      effortLevel: 5,
      strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
      }
    });

    const savedWorkout = {
      ...workout,
      id: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date().toISOString(),
      isFavorite: false
    };

    const result = SavedWorkoutSchema.safeParse(savedWorkout);
    expect(result.success).toBe(true);
  });

  it('should be able to serialize to JSON and back', () => {
    const workout = generateWorkout({
        poolSize: 25,
        poolUnit: PoolSizeUnit.Yards,
        totalTimeMinutes: 30,
        availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
        focus: TrainingFocus.Mixed,
        preferredStrokes: [],
        effortLevel: 5,
        strokePreferences: {
            Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
        }
      });

      const json = JSON.stringify(workout);
      const parsed = JSON.parse(json);
      
      const validation = WorkoutSchema.safeParse(parsed);
      expect(validation.success).toBe(true);
  });
});