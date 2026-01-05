import { describe, it, expect } from 'vitest';
import { basicIntervalGenerator } from './basic';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Basic Interval Generator', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Aerobic,
    effortLevel: 5
  };

  it('should generate a simple set of 100s if time allows', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 600 // 10 minutes
    };

    const result = basicIntervalGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    // Assuming 1:30 pace per 100 for default calc
    // 10 mins = 600s. 600 / 90 = 6.66 -> 6 reps
    expect(result![0].reps).toBeGreaterThan(0);
    expect(result![0].distance).toBe(100);
  });

  it('should return null if time budget is too small for even one rep', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 30 // Too short for a 100 swim
    };

    const result = basicIntervalGenerator.generate(mockContext, constraints);

    expect(result).toBeNull();
  });
});
