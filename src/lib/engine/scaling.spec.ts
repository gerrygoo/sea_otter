import { describe, it, expect } from 'vitest';
import { pyramidGenerator } from './generators/patterns';
import { PoolSizeUnit, TrainingFocus } from './types';
import type { GeneratorContext, GeneratorConstraints } from './types';

describe('Scaling Logic (Pyramid)', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Aerobic,
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should scale down to a mini-pyramid (50-100-50) if budget is tight', () => {
    // 50-100-50 = 200 total distance.
    // At 1:30/100 pace -> approx 3 minutes (180s)
    
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 200 // Tight budget, definitely can't do 100-200-300...
    };

    const result = pyramidGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(3); // 50, 100, 50
    expect(result![1].distance).toBe(100); // Peak
  });

  it('should scale up to a giant pyramid or repeat if budget is large (60 mins)', () => {
    // 60 mins = 3600s. @ 1:30/100y -> 4000 yards theoretical max.
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 3600
    };

    const result = pyramidGenerator.generate(mockContext, constraints);
    
    expect(result).not.toBeNull();
    const totalDistance = result!.reduce((acc, s) => acc + s.distance * s.reps, 0);
    
    // Expect at least 2000 yards (Standard pyramid is 900)
    expect(totalDistance).toBeGreaterThan(2000);
  });
});