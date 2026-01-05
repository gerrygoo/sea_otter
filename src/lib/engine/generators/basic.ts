import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle } from '../types';

export const basicIntervalGenerator: SetGenerator = (context, constraints) => {
  const baseIntervalPer100 = 90; // Default 1:30 pace, TODO: make dynamic based on effortLevel
  const distance = 100;
  
  // Calculate how many 100s fit in the time budget
  // Note: This is a very simple approximation.
  const reps = Math.floor(constraints.timeBudgetSeconds / baseIntervalPer100);

  if (reps < 1) {
    return null;
  }

  const set: SwimSet = {
    reps,
    distance,
    stroke: StrokeStyle.Free,
    description: `Basic Aerobic Set: ${reps} x 100 Free @ 1:30`,
    intervalSeconds: baseIntervalPer100,
    gearUsed: []
  };

  return [set];
};
