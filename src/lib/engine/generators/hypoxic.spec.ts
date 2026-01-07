import { describe, it, expect } from 'vitest';
import { hypoxicGenerator } from './hypoxic';
import { PoolSizeUnit, TrainingFocus } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Hypoxic Generator', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should generate a hypoxic ladder (250, 200, 150, 100, 50) with breathing instructions', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 1800 
    };

    const result = hypoxicGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(5);
    
    // Check distances
    expect(result![0].distance).toBe(250);
    expect(result![4].distance).toBe(50);

    // Check descriptions for breathing pattern
    expect(result![0].description).toContain('Breathe every 3');
    expect(result![1].description).toContain('Breathe every 4');
    expect(result![4].description).toContain('Breathe every 7');
  });

  it('should return null if time budget is too small', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 60 
    };
    const result = hypoxicGenerator.generate(mockContext, constraints);
    expect(result).toBeNull();
  });
});
