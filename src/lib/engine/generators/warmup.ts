import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';
import { estimateDistanceDuration } from '../utils';

export const mixedWarmupGenerator: SetGenerator = {
  name: 'Mixed Warmup (Swim/Kick/Pull)',
  focusAlignment: {
    [TrainingFocus.Aerobic]: 1.0,
    [TrainingFocus.Endurance]: 0.9,
    [TrainingFocus.Technique]: 0.8,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    // Check if Kick or Pull are disabled
    const canKick = context.strokePreferences[StrokeStyle.Kick] > 1 && context.availableGear.kickboard;
    const canPull = context.strokePreferences[StrokeStyle.Pull] > 1 && context.availableGear.pullBuoy;

    const sets: SwimSet[] = [];
    let remainingTime = constraints.timeBudgetSeconds;

    // 1. Swim Part (Free) - Always include a swim
    const swimDist = 200;
    const swimDur = estimateDistanceDuration(swimDist, 100); // 1:40 pace for warmup
    
    if (remainingTime < swimDur) return null; // Not enough time for even the swim

    sets.push({
        reps: 1,
        distance: swimDist,
        stroke: StrokeStyle.Free,
        description: 'Warmup Swim (Easy)',
        intervalSeconds: swimDur,
        gearUsed: []
    });
    remainingTime -= swimDur;

    // 2. Kick Part (if time and gear permits)
    if (canKick) {
        const kickDist = 100;
        const kickDur = estimateDistanceDuration(kickDist, 130); // Kick is slower
        if (remainingTime >= kickDur) {
            sets.push({
                reps: 1,
                distance: kickDist,
                stroke: StrokeStyle.Kick,
                description: 'Warmup Kick (Easy)',
                intervalSeconds: kickDur,
                gearUsed: ['kickboard']
            });
            remainingTime -= kickDur;
        }
    }

    // 3. Pull Part (if time and gear permits)
    if (canPull) {
        const pullDist = 100;
        const pullDur = estimateDistanceDuration(pullDist, 110);
        if (remainingTime >= pullDur) {
            sets.push({
                reps: 1,
                distance: pullDist,
                stroke: StrokeStyle.Pull,
                description: 'Warmup Pull (Easy)',
                intervalSeconds: pullDur,
                gearUsed: ['pullBuoy']
            });
            remainingTime -= pullDur;
        }
    }

    return sets;
  }
};

export const pyramidWarmupGenerator: SetGenerator = {
  name: 'Pyramid Warmup',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Aerobic]: 0.9,
    [TrainingFocus.Mixed]: 0.8
  },
  generate: (context, constraints) => {
    const baseInterval = 100; // Warmup pace
    // 100, 200, 100 sequence
    const distances = [100, 200, 100];
    const totalDist = distances.reduce((a,b) => a+b, 0);
    const totalDur = estimateDistanceDuration(totalDist, baseInterval);

    if (totalDur > constraints.timeBudgetSeconds) {
        // Try smaller pyramid: 50, 100, 50
        const smallDistances = [50, 100, 50];
        const smallTotalDur = estimateDistanceDuration(200, baseInterval);
        if (smallTotalDur <= constraints.timeBudgetSeconds) {
             return smallDistances.map(d => ({
                reps: 1,
                distance: d,
                stroke: StrokeStyle.Free,
                description: `${d} Free (Warmup Pyramid)`,
                intervalSeconds: estimateDistanceDuration(d, baseInterval),
                gearUsed: []
            }));
        }
        return null;
    }

    return distances.map(d => ({
        reps: 1,
        distance: d,
        stroke: StrokeStyle.Free,
        description: `${d} Free (Warmup Pyramid)`,
        intervalSeconds: estimateDistanceDuration(d, baseInterval),
        gearUsed: []
    }));
  }
};
