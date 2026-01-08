import { describe, it, expect } from 'vitest';
import { testSetGenerator } from './test_sets';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, SetStructure, Modality } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Test Set Generator', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Threshold,
    effortLevel: 5,
    strokePreferences: {
        [StrokeStyle.Free]: 3, [StrokeStyle.Back]: 3, [StrokeStyle.Breast]: 3, [StrokeStyle.Fly]: 3, [StrokeStyle.IM]: 3, [StrokeStyle.Drill]: 3, [StrokeStyle.Kick]: 3, [StrokeStyle.Pull]: 3
    },
    cssPace: 100
  };

  it('should generate a test set with isTest: true', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 1000
    };

    const result = testSetGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].isTest).toBe(true);
    expect(result![0].structure).toBe(SetStructure.Test);
    // Test sets are max effort
    expect(result![0].intensity).toBe('max-effort');
  });

  it('should respect modality injection', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 1000,
      modality: Modality.Swim
    };

    const result = testSetGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].modality).toBe(Modality.Swim);
  });
});
