import type { SetGenerator } from '../types';
import { StrokeStyle } from '../types';
import { estimateDistanceDuration } from '../utils';

export const hypoxicGenerator: SetGenerator = (context, constraints) => {
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

  return steps.map(step => ({
    reps: 1,
    distance: step.distance,
    stroke: StrokeStyle.Free,
    description: `Hypoxic Ladder: Breathe every ${step.breathe}`,
    intervalSeconds: estimateDistanceDuration(step.distance, baseInterval),
    gearUsed: []
  }));
};
