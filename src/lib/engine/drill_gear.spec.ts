import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Drill Gear Filtering', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Technique,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
      [StrokeStyle.Free]: 5,
      [StrokeStyle.Back]: 1,
      [StrokeStyle.Breast]: 1,
      [StrokeStyle.Fly]: 1,
      [StrokeStyle.IM]: 1,
      [StrokeStyle.Drill]: 5,
      [StrokeStyle.Kick]: 1,
      [StrokeStyle.Pull]: 1,
    }
  };

  it('should NOT select a drill if required gear is missing', () => {
    // Only 6-3-6 Drill for Free requires Fins.
    // If Fins are missing, it should never be picked.
    
    const params = {
      ...baseParams,
      availableGear: { ...baseParams.availableGear, fins: false }
    };

    for (let i = 0; i < 20; i++) {
      const workout = generateWorkout(params);
      const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
      const drillSets = allSets.filter(s => s.description.toLowerCase().includes('drill'));
      
      drillSets.forEach(s => {
        expect(s.description).not.toContain('6-3-6');
      });
    }
  });

  it('SHOULD select a gear-requiring drill if gear is available', () => {
    const params = {
      ...baseParams,
      availableGear: { ...baseParams.availableGear, fins: true }
    };

    let found636 = false;
    for (let i = 0; i < 50; i++) {
      const workout = generateWorkout(params);
      const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
      const drillSets = allSets.filter(s => s.description.toLowerCase().includes('6-3-6'));
      if (drillSets.length > 0) {
        found636 = true;
        break;
      }
    }
    expect(found636).toBe(true);
  });
});
