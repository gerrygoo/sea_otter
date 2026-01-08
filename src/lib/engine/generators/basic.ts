import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { getAvailableStrokes, pickStroke } from '../utils';
import { applyModality } from '../modality';

export const basicIntervalGenerator: SetGenerator = {
  name: 'Basic Interval Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Threshold]: 1.0,
    [TrainingFocus.Strength]: 0.9,
    [TrainingFocus.Technique]: 0.6
  },
  generate: (context, constraints) => {
    const baseIntervalPer100 = 90; // Default 1:30 pace
    const distance = 100;
    
    const reps = Math.floor(constraints.timeBudgetSeconds / baseIntervalPer100);

    if (reps < 1) {
      return null;
    }

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    const modality = constraints.modality || Modality.Swim;

    const set: SwimSet = {
      reps,
      distance,
      stroke,
      description: `Basic Set: ${reps} x 100 ${stroke} @ 1:30`,
      intervalSeconds: baseIntervalPer100,
      gearUsed: [],
      structure: SetStructure.Basic,
      modality
    };

    return [applyModality(set, modality)];
  }
};
