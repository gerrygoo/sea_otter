import { describe, it, expect } from 'vitest';
import { tagWorkout } from './tagging';
import type { Workout, SwimSet } from './types';
import { StrokeStyle } from './types';

describe('tagWorkout', () => {
  const dummySet = (desc: string): SwimSet => ({
    reps: 1,
    distance: 100,
    stroke: StrokeStyle.Free,
    description: desc,
    intervalSeconds: 90
  });

  const emptyWorkout: Workout = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: [],
    totalDistance: 0,
    estimatedDurationMinutes: 0
  };

  it('should tag a workout with "Endurance" if description contains "Basic Aerobic"', () => {
    const workout: Workout = {
      ...emptyWorkout,
      mainSet: [dummySet('Basic Aerobic Set: 10 x 100')]
    };
    const tags = tagWorkout(workout);
    expect(tags).toContain('Endurance');
  });

  it('should tag a workout with "Mixed" if description contains "Pyramid"', () => {
    const workout: Workout = {
      ...emptyWorkout,
      mainSet: [dummySet('Pyramid part: 100 Free')]
    };
    const tags = tagWorkout(workout);
    expect(tags).toContain('Mixed');
  });

    it('should tag a workout with "Technique" if description contains "Drill"', () => {
    const workout: Workout = {
      ...emptyWorkout,
      mainSet: [dummySet('Drill Set: 4 x 50')]
    };
    const tags = tagWorkout(workout);
    expect(tags).toContain('Technique');
  });
});
