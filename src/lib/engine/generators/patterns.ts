import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle } from '../types';

// Helper to estimate duration (very rough, 1:30/100 default)
const estimateDuration = (distance: number, intervalPer100: number = 90) => {
  return (distance / 100) * intervalPer100;
};

export const pyramidGenerator: SetGenerator = (context, constraints) => {
  const baseInterval = 90;
  // Standard Pyramid: 100, 200, 300, 200, 100
  const distances = [100, 200, 300, 200, 100];
  
  const totalDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);

  if (totalDuration > constraints.timeBudgetSeconds) {
    // TODO: Implement scaling down logic (e.g., 50, 100, 150...) if budget is tight
    return null;
  }

  return distances.map(distance => ({
    reps: 1,
    distance,
    stroke: StrokeStyle.Free,
    description: `Pyramid part: ${distance} Free`,
    intervalSeconds: estimateDuration(distance, baseInterval),
    gearUsed: []
  }));
};

export const ladderGenerator: SetGenerator = (context, constraints) => {
  const baseInterval = 90;
  // Standard Ladder: 100, 200, 300, 400
  const distances = [100, 200, 300, 400];
  
  const totalDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);

  if (totalDuration > constraints.timeBudgetSeconds) {
    return null;
  }

  return distances.map(distance => ({
    reps: 1,
    distance,
    stroke: StrokeStyle.Free,
    description: `Ladder part: ${distance} Free`,
    intervalSeconds: estimateDuration(distance, baseInterval),
    gearUsed: []
  }));
};
