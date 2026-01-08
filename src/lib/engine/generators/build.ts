import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { getAvailableStrokes, pickStroke, estimateDistanceDuration } from '../utils';
import { applyModality } from '../modality';
import { getTargetPace, getBuildIntensityLabel, EffortIntensity } from '../pace_logic';

export const buildGenerator: SetGenerator = {
  name: 'Build Set',
  focusAlignment: {
    [TrainingFocus.Technique]: 0.9,
    [TrainingFocus.Speed]: 0.8,
    [TrainingFocus.Mixed]: 0.7
  },
  generate: (context, constraints) => {
    const distance = 50;
    const reps = 6;
    const modality = constraints.modality || Modality.Swim;

    const basePace = getTargetPace(context, EffortIntensity.Easy) || 115;
    const baseInterval = basePace + 20;
    const totalDuration = reps * estimateDistanceDuration(distance, baseInterval);

    if (totalDuration > constraints.timeBudgetSeconds) {
      return null;
    }

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    const set: SwimSet = {
      reps,
      distance,
      stroke,
      description: `${reps} x ${distance} ${stroke} Build (Acceleration)`,
      intensity: getBuildIntensityLabel(),
      intervalSeconds: baseInterval,
      structure: SetStructure.Build,
      modality
    };

    return [applyModality(set, modality)];
  }
};
