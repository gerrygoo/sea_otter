import type { GeneratorContext } from './types';

export enum EffortIntensity {
  Easy = 'Easy',
  Neutral = 'Neutral',
  Hard = 'Hard'
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
      return base + 10; // 10s slower than CSS
    case EffortIntensity.Neutral:
      return base;
    case EffortIntensity.Hard:
      return base - 5; // 5s faster than CSS
    default:
      return base;
  }
}
