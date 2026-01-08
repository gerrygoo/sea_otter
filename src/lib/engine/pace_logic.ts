import type { GeneratorContext } from './types';

import { TrainingFocus } from './types';

export enum EffortIntensity {
  Easy = 'easy',
  ModerateEasy = 'moderate-easy',
  Normal = 'normal',
  Hard = 'hard',
  MaxEffort = 'max-effort'
}

/**
 * Maps TrainingFocus to its primary intensity zone.
 */
export function getFocusIntensity(focus: TrainingFocus): EffortIntensity {
  switch (focus) {
    case TrainingFocus.Endurance:
      return EffortIntensity.ModerateEasy;
    case TrainingFocus.Speed:
      return EffortIntensity.MaxEffort;
    case TrainingFocus.Strength:
      return EffortIntensity.Hard;
    case TrainingFocus.Technique:
      return EffortIntensity.Easy;
    case TrainingFocus.Threshold:
      return EffortIntensity.Normal;
    case TrainingFocus.Mixed:
      return EffortIntensity.Normal;
    default:
      return EffortIntensity.Normal;
  }
}

/**
 * Calculates recommended rest seconds based on TrainingFocus and set parameters.
 */
export function getRestSeconds(focus: TrainingFocus, distance: number, pacePer100: number): number {
  const swimTime = (distance / 100) * pacePer100;

  switch (focus) {
    case TrainingFocus.Endurance:
      return 15; // 10s - 20s
    case TrainingFocus.Threshold:
      return 12; // 10s - 15s
    case TrainingFocus.Strength:
      return 25; // 20s - 30s
    case TrainingFocus.Technique:
      return 25; // 20s - 30s
    case TrainingFocus.Speed:
      // 1:2 to 1:4 ratio. Let's use 1:3 as default for speed
      return Math.max(30, Math.round(swimTime * 3));
    case TrainingFocus.Mixed:
      return 20;
    default:
      return 20;
  }
}

/**
 * Returns the intensity label for a Build set.
 */
export function getBuildIntensityLabel(): string {
  return "Z1 -> Z5";
}

/**
 * Calculates the target pace per 100 based on CSS and intensity.
 * 
 * @param context Generator context containing cssPace
 * @param intensity Desired effort level
 * @returns Target pace per 100 in seconds, or null if no CSS provided
 */
export function getTargetPace(context: GeneratorContext, intensity: EffortIntensity): number | null {
  if (context.cssPace === undefined) {
    return null;
  }

  const base = context.cssPace;

  switch (intensity) {
    case EffortIntensity.Easy:
      return base + 15; // Z1: CSS + 15s
    case EffortIntensity.ModerateEasy:
      return base + 6;  // Z2: CSS + 4s to +8s (midpoint)
    case EffortIntensity.Normal:
      return base + 1;  // Z3: CSS to +2s (midpoint)
    case EffortIntensity.Hard:
      return base - 3;  // Z4: CSS - 2s to -4s (midpoint)
    case EffortIntensity.MaxEffort:
      return base - 6;  // Z5: CSS - 6s
    default:
      return base;
  }
}

/**
 * Calculates a list of descending target paces per 100.
 * Decrement is applied to the pace per 100.
 */
export function getDescendingTargetTimes(basePace: number, distance: number, reps: number, decrement: number): number[] {
  const paces: number[] = [];
  for (let i = 0; i < reps; i++) {
    paces.push(basePace - (i * decrement));
  }
  return paces;
}
