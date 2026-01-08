import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { estimateDistanceDuration } from '../utils';
import { applyModality } from '../modality';

export const hypoxicGenerator: SetGenerator = {
  name: 'Hypoxic Ladder',
  focusAlignment: {
    [TrainingFocus.Endurance]: 0.8,
    [TrainingFocus.Technique]: 0.6 // Breath control is technique
  },
  generate: (context, constraints) => {
    // Hypoxic is almost always Free. If Free is Never, skip this generator.
    if (context.strokePreferences[StrokeStyle.Free] === 1) {
      return null;
    }

    const baseInterval = 100; // Slower pace for hypoxic work
    
    const steps = [
      { distance: 250, breathe: 3 },
      { distance: 200, breathe: 4 },
      { distance: 150, breathe: 5 },
      { distance: 100, breathe: 6 },
      { distance: 50, breathe: 7 }
    ];

    const totalDistance = steps.reduce((acc, s) => acc + s.distance, 0);
    const totalDuration = estimateDistanceDuration(totalDistance, baseInterval);

    if (totalDuration > constraints.timeBudgetSeconds) {
      return null;
    }

    return steps.map(step => {
      const set = {
        reps: 1,
        distance: step.distance,
        stroke: StrokeStyle.Free,
        description: `Hypoxic Ladder: Breathe every ${step.breathe}`,
        intervalSeconds: estimateDistanceDuration(step.distance, baseInterval),
        gearUsed: [],
        structure: SetStructure.Ladder,
        modality: Modality.Hypoxic
      };
      return applyModality(set, Modality.Hypoxic);
    });
  }
};
