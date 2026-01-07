/**
 * Calculates Critical Swim Speed (CSS) pace in seconds per 100 units.
 * Formula: CSS Pace = (time400 - time200) / 2
 * 
 * @param time400Seconds Time for 400 distance units in seconds
 * @param time200Seconds Time for 200 distance units in seconds
 * @returns CSS Pace in seconds per 100 units, or null if invalid inputs
 */
export function calculateCSSPace(time400Seconds: number, time200Seconds: number): number | null {
  if (time400Seconds <= time200Seconds) {
    return null;
  }
  
  // The formula for speed (m/s) is (400 - 200) / (t400 - t200) = 200 / delta_t
  // The formula for pace (s/100m) is 100 / speed = 100 / (200 / delta_t) = delta_t / 2
  const deltaT = time400Seconds - time200Seconds;
  return deltaT / 2;
}
