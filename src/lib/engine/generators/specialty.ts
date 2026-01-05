import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';
import { estimateDistanceDuration } from '../utils';

export const underwaterGenerator: SetGenerator = {
  name: 'Underwater No-Breath',
  focusAlignment: {
    [TrainingFocus.Technique]: 1.0,
    [TrainingFocus.Speed]: 0.7,
    [TrainingFocus.Strength]: 0.5
  },
  generate: (context, constraints) => {
    const distance = 25;
    const baseInterval = 60; // Usually generous rest for no-breath work
    
    const reps = Math.floor(constraints.timeBudgetSeconds / baseInterval);

    if (reps < 1) return null;

    // We can cap it at 8 reps to avoid over-exhaustion in a single set
    const finalReps = Math.min(reps, 8);

    return [{
      reps: finalReps,
      distance,
      stroke: 'Dolphin Kick Underwater',
      description: `Underwater 25s: No breath, focused on tight streamline and powerful dolphin kick.`,
      intervalSeconds: baseInterval,
      gearUsed: []
    }];
  }
};
