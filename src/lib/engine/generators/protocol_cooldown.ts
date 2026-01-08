import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { estimateDistanceDuration, pickStroke, getAvailableStrokes } from '../utils';
import { EffortIntensity, getFocusIntensity } from '../pace_logic';

export const protocolCooldownGenerator: SetGenerator = {
  name: 'Protocol Cooldown',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Threshold]: 1.0,
    [TrainingFocus.Speed]: 1.0,
    [TrainingFocus.Strength]: 1.0,
    [TrainingFocus.Technique]: 1.0,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    const totalBudget = constraints.timeBudgetSeconds;
    if (totalBudget < 120) return null; // Min 2 mins

    // Scale volume based on focus (as proxy for intensity)
    const intensity = getFocusIntensity(context.focus);
    let volumeScale = 0.10; // Default 10%
    
    if (intensity === EffortIntensity.Hard || intensity === EffortIntensity.MaxEffort) {
        volumeScale = 0.15; // Higher volume for high intensity
    }

    const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
    const availableStrokes = getAvailableStrokes(context.strokePreferences, [...standardStrokes, StrokeStyle.Choice]);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    const dist = Math.max(100, Math.floor((totalBudget / 100) * 100));

    const set: SwimSet = {
        reps: 1,
        distance: dist,
        stroke: stroke,
        description: `Cooldown: Easy ${stroke} Swim (Double Arm Backstroke recommended)`,
        intensity: EffortIntensity.Easy,
        intervalSeconds: estimateDistanceDuration(dist, 110), // Slow pace
        structure: SetStructure.Basic,
        modality: Modality.Swim
    };

    return [set];
  }
};
