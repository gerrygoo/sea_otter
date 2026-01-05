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
