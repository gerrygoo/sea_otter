import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Drill Alignment', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Technique, // Higher chance of picking drill generator
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
      [StrokeStyle.Free]: 1,
      [StrokeStyle.Back]: 1,
      [StrokeStyle.Breast]: 1,
      [StrokeStyle.Fly]: 5, // Butterfly is preferred
      [StrokeStyle.IM]: 1,
      [StrokeStyle.Drill]: 5, // Drill is enabled
      [StrokeStyle.Kick]: 1,
      [StrokeStyle.Pull]: 1,
    }
  };

  it('should generate Fly drills when Fly is prioritized and Drill is enabled', () => {
    const workout = generateWorkout(baseParams);
    const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
    
    const drillSets = allSets.filter(s => s.description.toLowerCase().includes('drill'));
    expect(drillSets.length).toBeGreaterThan(0);
    
    // All drills should be Fly because all other styles are Never
    drillSets.forEach(s => {
      expect(s.stroke).toBe(StrokeStyle.Fly);
    });
  });
});
