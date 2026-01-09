import { StrokeStyle, type StrokePreferences } from './types';

export const yardsToMeters = (yards: number): number => {
  return yards * 0.9144;
};

export const metersToYards = (meters: number): number => {
  return meters * 1.09361;
};

export const roundToNearest = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

export const estimateDistanceDuration = (distance: number, secondsPer100: number): number => {
  return (distance / 100) * secondsPer100;
};

export const formatDuration = (totalSeconds: number): string => {
  const roundedSeconds = Math.round(totalSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const roundToNearestWall = (distance: number, poolLength: number): number => {
  const roundTrip = poolLength * 2;
  return Math.floor(distance / roundTrip) * roundTrip;
};

/**
 * Returns a list of strokes that are not set to 'Never' (1).
 * Implements "Smart Fallback": if all are 1, returns [Freestyle].
 */
export const getAvailableStrokes = (
  prefs: StrokePreferences,
  allowedStyles: StrokeStyle[] = [
    StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly, StrokeStyle.IM
  ]
): StrokeStyle[] => {
  const available = allowedStyles.filter(s => prefs[s as keyof StrokePreferences] > 1);
  
  if (available.length === 0) {
    return [StrokeStyle.Free];
  }
  
  return available;
};

/**
 * Picks a stroke from the available options based on weights.
 */
export const pickStroke = (
  prefs: StrokePreferences,
  availableStrokes: StrokeStyle[]
): StrokeStyle => {
  if (availableStrokes.length === 0) return StrokeStyle.Free;
  if (availableStrokes.length === 1) return availableStrokes[0];

  // Calculate total weight
  const totalWeight = availableStrokes.reduce((acc, s) => acc + prefs[s as keyof StrokePreferences], 0);
  
  let random = Math.random() * totalWeight;
  
  for (const stroke of availableStrokes) {
    random -= prefs[stroke as keyof StrokePreferences];
    if (random <= 0) {
      return stroke;
    }
  }

  return availableStrokes[0];
};
