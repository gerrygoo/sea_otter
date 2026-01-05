import type { SetGenerator } from '../types';
import { StrokeStyle, TrainingFocus } from '../types';

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

    for (const distances of variations) {
      const totalDuration = distances.reduce((acc, d) => acc + estimateDuration(d, baseInterval), 0);
      
      if (totalDuration <= constraints.timeBudgetSeconds) {
        return distances.map(distance => ({
          reps: 1,
          distance,
          stroke: StrokeStyle.Free,
          description: `Pyramid part: ${distance} Free`,
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

    return distances.map(distance => ({
      reps: 1,
      distance,
      stroke: StrokeStyle.Free,
      description: `Ladder part: ${distance} Free`,
      intervalSeconds: estimateDuration(distance, baseInterval),
      gearUsed: []
    }));
  }
};