import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { estimateDistanceDuration } from '../utils';
import { EffortIntensity } from '../pace_logic';

export const testSetGenerator: SetGenerator = {
  name: 'Test Set (Time Trial)',
  focusAlignment: {
    [TrainingFocus.Threshold]: 1.0,
    [TrainingFocus.Endurance]: 0.5,
    [TrainingFocus.Speed]: 0.5
  },
  generate: (context, constraints) => {
    // Tests are usually 400m or 200m
    const distance = 400;
    const reps = 1;
    const modality = constraints.modality || Modality.Swim;

    // Full recovery rest (e.g. 5 minutes)
    const restSeconds = 300;
    
    const totalDuration = estimateDistanceDuration(distance, 100) + restSeconds;

    if (totalDuration > constraints.timeBudgetSeconds) {
      return null;
    }

    const set: SwimSet = {
      reps,
      distance,
      stroke: StrokeStyle.Free,
      description: `CSS Test: ${distance}m Max Effort. Record your time.`,
      intensity: EffortIntensity.MaxEffort,
      restSeconds,
      structure: SetStructure.Test,
      modality,
      isTest: true
    };

    return [set];
  }
};
