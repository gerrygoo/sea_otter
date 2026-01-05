import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';

export const basicIntervalGenerator: SetGenerator = {
  name: 'Basic Interval Set',
  focusAlignment: {
    [TrainingFocus.Aerobic]: 1.0,
    [TrainingFocus.Endurance]: 0.9,
    [TrainingFocus.Technique]: 0.5
  },
  generate: (context, constraints) => {
    const baseIntervalPer100 = 90; // Default 1:30 pace
    const distance = 100;
    
    const reps = Math.floor(constraints.timeBudgetSeconds / baseIntervalPer100);

    if (reps < 1) {
      return null;
    }

    const set = {
      reps,
      distance,
      stroke: StrokeStyle.Free,
      description: `Basic Aerobic Set: ${reps} x 100 Free @ 1:30`,
      intervalSeconds: baseIntervalPer100,
      gearUsed: []
    };

    return [set];
  }
};
