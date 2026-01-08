import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { getAvailableStrokes, pickStroke, estimateDistanceDuration } from '../utils';
import { applyModality } from '../modality';
import { getTargetPace, getDescendingTargetTimes, EffortIntensity } from '../pace_logic';

export const descendingGenerator: SetGenerator = {
  name: 'Descending Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 0.8,
    [TrainingFocus.Threshold]: 0.9,
    [TrainingFocus.Speed]: 0.7,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    const distance = 100;
    const reps = 4;
    const decrement = 5; // 5s per rep faster
    const modality = constraints.modality || Modality.Swim;

    const basePace = getTargetPace(context, EffortIntensity.Normal) || 100;
    
    const baseInterval = basePace + 20; 
    const totalDuration = reps * estimateDistanceDuration(distance, baseInterval);

    if (totalDuration > constraints.timeBudgetSeconds) {
      return null;
    }

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    const paces = getDescendingTargetTimes(basePace, distance, reps, decrement);

    return paces.map((pace, i) => {
      const set: SwimSet = {
        reps: 1,
        distance,
        stroke,
        description: `${distance} ${stroke} Descending (${i + 1}/${reps})`,
        targetPacePer100: pace,
        intervalSeconds: pace + 20,
        structure: SetStructure.Descending,
        modality
      };
      return applyModality(set, modality);
    });
  }
};
