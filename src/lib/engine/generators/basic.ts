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
    const distancePerRep = 100;
    let reps: number;
    
    if (constraints.distanceBudget) {
      reps = Math.floor(constraints.distanceBudget / distancePerRep);
    } else {
      const baseIntervalPer100 = 90; // Default 1:30 pace
      reps = Math.floor(constraints.timeBudgetSeconds / baseIntervalPer100);
    }

    if (reps < 1) {
      return null;
    }

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    const modality = constraints.modality || Modality.Swim;

    const set: SwimSet = {
      reps,
      distance: distancePerRep,
      stroke,
      description: `Basic Set: ${reps} x ${distancePerRep} ${stroke} @ 1:30`,
      intervalSeconds: 90,
      gearUsed: [],
      structure: SetStructure.Basic,
      modality
    };

    return [applyModality(set, modality)];
  }
};
