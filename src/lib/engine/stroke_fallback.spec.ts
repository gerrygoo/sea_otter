import { describe, it, expect } from 'vitest';
import { generateWorkout } from './index';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';
import type { WorkoutParameters } from './types';

describe('Stroke Fallback (All Never)', () => {
  const baseParams: WorkoutParameters = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Mixed,
    preferredStrokes: [],
    effortLevel: 5,
    strokePreferences: {
      [StrokeStyle.Free]: 1,
      [StrokeStyle.Back]: 1,
      [StrokeStyle.Breast]: 1,
      [StrokeStyle.Fly]: 1,
      [StrokeStyle.IM]: 1,
      [StrokeStyle.Drill]: 1,
      [StrokeStyle.Kick]: 1,
      [StrokeStyle.Pull]: 1,
    }
  };

  it('should fallback to Freestyle when all strokes are set to Never', () => {
    const workout = generateWorkout(baseParams);
    const allSets = [...workout.warmup, ...workout.preset, ...workout.mainSet, ...workout.cooldown];
    
    // Check that we have sets (generation didn't crash or return empty)
    expect(allSets.length).toBeGreaterThan(0);
    
    // Check that they are all Freestyle (as it is the fallback)
    const nonFreeSets = allSets.filter(s => s.stroke !== StrokeStyle.Free);
    
    // Some specialty sets might have custom stroke strings like 'Dolphin Kick Underwater'
    // But basic generators should have defaulted to Free.
    const standardSets = allSets.filter(s => typeof s.stroke === 'string' && Object.values(StrokeStyle).includes(s.stroke as StrokeStyle));
    const standardNonFree = standardSets.filter(s => s.stroke !== StrokeStyle.Free);
    
    expect(standardNonFree).toHaveLength(0);
  });
});
