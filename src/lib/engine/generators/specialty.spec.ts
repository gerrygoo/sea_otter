import { describe, it, expect } from 'vitest';
import { underwaterGenerator } from './specialty';
import { PoolSizeUnit, TrainingFocus } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Specialty Generators - Underwater', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Technique,
    effortLevel: 5,
    strokePreferences: {
        Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  it('should generate underwater 25s without breathing', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 300 // 5 minutes
    };

    const result = underwaterGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].distance).toBe(25);
    expect(result![0].description.toLowerCase()).toContain('no breath');
    expect(result![0].stroke).toContain('Underwater');
  });
});
