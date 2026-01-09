import type { SetGenerator, SwimSet } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { estimateDistanceDuration, pickStroke, getAvailableStrokes } from '../utils';
import { EffortIntensity, getBuildIntensityLabel } from '../pace_logic';
import { applyModality } from '../modality';

export const protocolWarmupGenerator: SetGenerator = {
  name: 'Protocol Warmup',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Threshold]: 1.0,
    [TrainingFocus.Speed]: 1.0,
    [TrainingFocus.Strength]: 1.0,
    [TrainingFocus.Technique]: 1.0,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    const sets: SwimSet[] = [];
    const isDistanceBased = constraints.distanceBudget !== undefined;
    const effectiveBudget = isDistanceBased 
      ? constraints.distanceBudget! 
      : Math.floor(constraints.timeBudgetSeconds / 100) * 100;
    
    // Min budget for structured warmup: 200m or 5 mins
    if (!isDistanceBased && constraints.timeBudgetSeconds < 300) return null;
    if (isDistanceBased && effectiveBudget < 200) return null;

    // Get available strokes for different phases
    const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
    const looseningStrokes = getAvailableStrokes(context.strokePreferences, [...standardStrokes, StrokeStyle.Choice]);
    const activationStrokes = getAvailableStrokes(context.strokePreferences, standardStrokes);
    const primingStrokes = getAvailableStrokes(context.strokePreferences, standardStrokes);

    const looseningStroke = pickStroke(context.strokePreferences, looseningStrokes);
    const activationStroke = pickStroke(context.strokePreferences, activationStrokes);
    const primingStroke = pickStroke(context.strokePreferences, primingStrokes);

    // 1. Loosening (45%)
    const looseningDist = Math.max(100, Math.floor(((effectiveBudget * 0.45) / 50) ) * 50); 
    sets.push({
        reps: 1,
        distance: looseningDist,
        stroke: looseningStroke,
        description: `Loosening: Easy ${looseningStroke} Swim`,
        intensity: EffortIntensity.Easy,
        intervalSeconds: estimateDistanceDuration(looseningDist, 100),
        structure: SetStructure.Basic,
        modality: Modality.Swim
    });

    // 2. Activation (35%)
    const activationBudget = effectiveBudget * 0.35;
    const activationRepDist = 50;
    const activationReps = Math.max(2, Math.floor(activationBudget / activationRepDist)); 
    sets.push(applyModality({
        reps: activationReps,
        distance: activationRepDist,
        stroke: activationStroke,
        description: `Activation: 25 Kick / 25 Drill (${activationStroke})`,
        intensity: EffortIntensity.Easy,
        intervalSeconds: 60,
        structure: SetStructure.Basic,
        modality: Modality.Drill
    }, Modality.Drill));

    // 3. Priming (20%)
    const primingBudget = effectiveBudget * 0.20;
    const primingRepDist = 25;
    const primingReps = Math.max(2, Math.floor(primingBudget / primingRepDist)); 
    
    if (context.focus === TrainingFocus.Speed) {
        sets.push({
            reps: primingReps,
            distance: primingRepDist,
            stroke: primingStroke,
            description: `Priming: Variable Speed (12.5 Fast / 12.5 Easy) - ${primingStroke}`,
            intensity: EffortIntensity.MaxEffort,
            intervalSeconds: 40,
            structure: SetStructure.Basic,
            modality: Modality.Swim
        });
    } else {
        // Default to Build for Endurance/Threshold/etc.
        sets.push({
            reps: primingReps,
            distance: primingRepDist,
            stroke: primingStroke,
            description: `Priming: 25m Build (Acceleration) - ${primingStroke}`,
            intensity: getBuildIntensityLabel(),
            intervalSeconds: 40,
            structure: SetStructure.Build,
            modality: Modality.Swim
        });
    }

    return sets;
  }
};
