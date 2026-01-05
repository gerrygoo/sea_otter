import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle } from '../types';
import { estimateDistanceDuration } from '../utils';

export const pullGenerator: SetGenerator = (context, constraints) => {
  // Requires Pull Buoy AND Paddles
  if (!context.availableGear.pullBuoy || !context.availableGear.paddles) {
    return null;
  }

  const baseInterval = 90;
  const distance = 200;
  const reps = Math.floor(constraints.timeBudgetSeconds / estimateDistanceDuration(distance, baseInterval));

  if (reps < 1) return null;

  return [{
    reps,
    distance,
    stroke: StrokeStyle.Free,
    description: `Pull Set: ${reps} x 200 Free (Pulls/Buoy)`,
    intervalSeconds: estimateDistanceDuration(distance, baseInterval),
    gearUsed: ['pullBuoy', 'paddles']
  }];
};

export const kickGenerator: SetGenerator = (context, constraints) => {
    // Requires Kickboard
    if (!context.availableGear.kickboard) {
      return null;
    }
  
    const baseInterval = 120; // Kick is slower
    const distance = 100;
    const reps = Math.floor(constraints.timeBudgetSeconds / estimateDistanceDuration(distance, baseInterval));
  
    if (reps < 1) return null;
  
    return [{
      reps,
      distance,
      stroke: StrokeStyle.Choice,
      description: `Kick Set: ${reps} x 100 Kick (Board)`,
      intervalSeconds: estimateDistanceDuration(distance, baseInterval),
      gearUsed: ['kickboard']
    }];
  };
