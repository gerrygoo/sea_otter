import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { getAvailableStrokes, pickStroke } from '../utils';
import { applyModality } from '../modality';

// Helper to estimate duration (very rough, 1:30/100 default)
const estimateDuration = (distance: number, intervalPer100: number = 90) => {
  return (distance / 100) * intervalPer100;
};

export const pyramidGenerator: SetGenerator = {
  name: 'Pyramid Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 0.9,
    [TrainingFocus.Threshold]: 0.8,
    [TrainingFocus.Strength]: 0.8,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    const baseInterval = 90;
    const modality = constraints.modality || Modality.Swim;
    
    const variations = [
      [200, 300, 400, 500, 400, 300, 200], // Giant (2300)
      [100, 200, 300, 400, 300, 200, 100], // Large (1600)
      [100, 200, 300, 200, 100],           // Standard (900)
      [50, 100, 150, 100, 50],             // Small (450)
      [50, 100, 50]                        // Mini (200)
    ];

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    let bestSets: SwimSet[] | null = null;
    let bestDuration = 0;

    for (const distances of variations) {
        const singleDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);
        
        // Max reps we can fit, but cap at 2 for pyramids to avoid excessive repetition of small ones
        const reps = Math.min(2, Math.floor(constraints.timeBudgetSeconds / singleDuration));
        
        if (reps >= 1) {
            const totalDur = reps * singleDuration;
            
            // We want to maximize time used.
            if (totalDur > bestDuration) {
                bestDuration = totalDur;
                bestSets = [];
                for (let i = 0; i < reps; i++) {
                    const roundDesc = reps > 1 ? ` (Round ${i+1})` : '';
                    const roundSets = distances.map(distance => {
                        const set: SwimSet = {
                            reps: 1,
                            distance,
                            stroke,
                            description: `${distance} ${stroke} (Pyramid)${roundDesc}`,
                            intervalSeconds: estimateDuration(distance, baseInterval),
                            gearUsed: [],
                            structure: SetStructure.Pyramid,
                            modality
                        };
                        return applyModality(set, modality);
                    });
                    bestSets.push(...roundSets);
                }
            }
        }
    }

    return bestSets;
  }
};

export const ladderGenerator: SetGenerator = {
  name: 'Ladder Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Threshold]: 0.9,
    [TrainingFocus.Strength]: 0.8
  },
  generate: (context, constraints) => {
    const baseInterval = 90;
    const modality = constraints.modality || Modality.Swim;
    
    const variations = [
      [100, 200, 300, 400, 500, 600], // Long (2100)
      [100, 200, 300, 400, 500],      // Medium (1500)
      [100, 200, 300, 400]            // Standard (1000)
    ];

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    let bestSets: SwimSet[] | null = null;
    let bestDuration = 0;

    for (const distances of variations) {
        const singleDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);
        const reps = Math.min(2, Math.floor(constraints.timeBudgetSeconds / singleDuration));
        
        if (reps >= 1) {
            const totalDur = reps * singleDuration;
            if (totalDur > bestDuration) {
                bestDuration = totalDur;
                bestSets = [];
                for (let i = 0; i < reps; i++) {
                    const roundDesc = reps > 1 ? ` (Round ${i+1})` : '';
                    const roundSets = distances.map(distance => {
                        const set: SwimSet = {
                            reps: 1,
                            distance,
                            stroke,
                            description: `${distance} ${stroke} (Ladder)${roundDesc}`,
                            intervalSeconds: estimateDuration(distance, baseInterval),
                            gearUsed: [],
                            structure: SetStructure.Ladder,
                            modality
                        };
                        return applyModality(set, modality);
                    });
                    bestSets.push(...roundSets);
                }
            }
        }
    }

    return bestSets;
  }
};
