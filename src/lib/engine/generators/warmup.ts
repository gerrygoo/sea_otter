import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';
import { estimateDistanceDuration } from '../utils';

export const mixedWarmupGenerator: SetGenerator = {
  name: 'Mixed Warmup (Swim/Kick/Pull)',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Technique]: 0.8,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    // Standard warmup is Free. If Free is disabled, skip this generator.
    if (context.strokePreferences[StrokeStyle.Free] === 1) {
      return null;
    }

    // Check if Kick or Pull are disabled
    const canKick = context.strokePreferences[StrokeStyle.Kick] > 1 && context.availableGear.kickboard;
    const canPull = context.strokePreferences[StrokeStyle.Pull] > 1 && context.availableGear.pullBuoy;

    const sets: SwimSet[] = [];
    let remainingTime = constraints.timeBudgetSeconds;
    
    // Calculate potential total distance based on a conservative warmup pace (e.g. 100s/100m)
    // We aim to fill ~90% of the budget to be safe
    const estPace = 100;
    const totalCapacity = Math.floor((constraints.timeBudgetSeconds * 0.95) / estPace) * 100;
    
    // Distribute capacity
    // If we have kick/pull, ratio: 50% Swim, 25% Kick, 25% Pull
    // If only swim: 100% Swim
    let swimRatio = 1.0;
    if (canKick && canPull) swimRatio = 0.5;
    else if (canKick || canPull) swimRatio = 0.6; // 60/40 split if one missing
    
    let swimDist = Math.max(200, Math.floor((totalCapacity * swimRatio) / 100) * 100);
    
    // Cap warmup swim at reasonable length unless huge budget? 
    // For general fitness, 600-800 swim is fine.
    // If budget is huge (slack utilization), let it grow.
    
    // 1. Swim Part
    const swimDur = estimateDistanceDuration(swimDist, 100);
    
    if (remainingTime < swimDur) {
        // Fallback to min 200
        swimDist = 200;
        // If still too big, return null (handled by upstream?) 
        // Actually estimateDistanceDuration(200, 100) = 200s (3m20s). 
        // If budget is < 3m20s, we probably can't do mixed warmup.
    }

    if (remainingTime >= estimateDistanceDuration(swimDist, 100)) {
        sets.push({
            reps: 1,
            distance: swimDist,
            stroke: StrokeStyle.Free,
            description: `Warmup Swim (Easy)`,
            intervalSeconds: estimateDistanceDuration(swimDist, 100),
            gearUsed: []
        });
        remainingTime -= estimateDistanceDuration(swimDist, 100);
    } else {
        return null; 
    }

    // 2. Kick Part
    if (canKick) {
        let kickDist = 100;
        if (canPull) {
             // 25% of total
             kickDist = Math.max(100, Math.floor((totalCapacity * 0.25) / 100) * 100);
        } else {
             // 40% of total
             kickDist = Math.max(100, Math.floor((totalCapacity * 0.40) / 100) * 100);
        }
        
        const kickDur = estimateDistanceDuration(kickDist, 130);
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

    // 3. Pull Part
    if (canPull) {
        let pullDist = 100;
        if (canKick) {
             // 25% of total
             pullDist = Math.max(100, Math.floor((totalCapacity * 0.25) / 100) * 100);
        } else {
             // 40% of total
             pullDist = Math.max(100, Math.floor((totalCapacity * 0.40) / 100) * 100);
        }

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
    [TrainingFocus.Mixed]: 0.8
  },
  generate: (context, constraints) => {
    // Standard warmup is Free. If Free is disabled, skip this generator.
    if (context.strokePreferences[StrokeStyle.Free] === 1) {
      return null;
    }

    const baseInterval = 100;
    
    // Define scalable variations
    const variations = [
      [200, 300, 200], // 700
      [100, 200, 100], // 400
      [50, 100, 50]    // 200
    ];

    for (const distances of variations) {
        const totalDist = distances.reduce((a,b) => a+b, 0);
        const totalDur = estimateDistanceDuration(totalDist, baseInterval);
        
        if (totalDur <= constraints.timeBudgetSeconds) {
             // If we have massive slack (e.g. can fit > 2x the largest), maybe repeat?
             // Or just stick to one pyramid for warmup to avoid exhaustion.
             return distances.map(d => ({
                reps: 1,
                distance: d,
                stroke: StrokeStyle.Free,
                description: `${d} Free (Warmup Pyramid)`,
                intervalSeconds: estimateDistanceDuration(d, baseInterval),
                gearUsed: []
            }));
        }
    }
    return null;
  }
};