import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { estimateDistanceDuration } from '../utils';
import { applyModality } from '../modality';

export const underwaterGenerator: SetGenerator = {
  name: 'Underwater No-Breath',
  focusAlignment: {
    [TrainingFocus.Technique]: 1.0,
    [TrainingFocus.Speed]: 0.7,
    [TrainingFocus.Strength]: 0.5
  },
  generate: (context, constraints) => {
    // Underwater work is heavily dolphin kick (Fly/Kick). If both are Never, skip.
    if (context.strokePreferences[StrokeStyle.Fly] === 1 && context.strokePreferences[StrokeStyle.Kick] === 1) {
      return null;
    }

    const distance = 25;
    const baseInterval = 60; // Usually generous rest for no-breath work
    
    const reps = Math.floor(constraints.timeBudgetSeconds / baseInterval);

    if (reps < 1) return null;

    // We can cap it at 8 reps to avoid over-exhaustion in a single set
    const finalReps = Math.min(reps, 8);

    const set = {
      reps: finalReps,
      distance,
      stroke: 'Dolphin Kick Underwater',
      description: `Underwater 25s: No breath, focused on tight streamline and powerful dolphin kick.`,
      intervalSeconds: baseInterval,
      gearUsed: [],
      structure: SetStructure.Basic,
      modality: Modality.Underwater
    };

    return [applyModality(set, Modality.Underwater)];
  }
};
