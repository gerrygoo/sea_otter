import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';
import { getAvailableStrokes, pickStroke } from '../utils';

// Helper to estimate duration (very rough, 1:30/100 default)
const estimateDuration = (distance: number, intervalPer100: number = 90) => {
  return (distance / 100) * intervalPer100;
};

export const pyramidGenerator: SetGenerator = {
  name: 'Pyramid Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 0.9,
    [TrainingFocus.Aerobic]: 0.8,
    [TrainingFocus.Mixed]: 1.0
  },
  generate: (context, constraints) => {
    const baseInterval = 90;
    
    // Try different pyramid scales: Standard, then Mini
    const variations = [
      [100, 200, 300, 200, 100], // Standard
      [50, 100, 150, 100, 50],   // Small
      [50, 100, 50]              // Mini
    ];

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    for (const distances of variations) {
      const totalDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);
      
      if (totalDuration <= constraints.timeBudgetSeconds) {
        return distances.map(distance => ({
          reps: 1,
          distance,
          stroke,
          description: `Pyramid part: ${distance} ${stroke}`,
          intervalSeconds: estimateDuration(distance, baseInterval),
          gearUsed: []
        }));
      }
    }

    return null;
  }
};

export const ladderGenerator: SetGenerator = {
  name: 'Ladder Set',
  focusAlignment: {
    [TrainingFocus.Endurance]: 1.0,
    [TrainingFocus.Aerobic]: 0.8
  },
  generate: (context, constraints) => {
    const baseInterval = 90;
    // Standard Ladder: 100, 200, 300, 400
    const distances = [100, 200, 300, 400];
    
    const totalDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);

    if (totalDuration > constraints.timeBudgetSeconds) {
      return null;
    }

    const availableStrokes = getAvailableStrokes(context.strokePreferences);
    const stroke = pickStroke(context.strokePreferences, availableStrokes);

    return distances.map(distance => ({
      reps: 1,
      distance,
      stroke,
      description: `Ladder part: ${distance} ${stroke}`,
      intervalSeconds: estimateDuration(distance, baseInterval),
      gearUsed: []
    }));
  }
};