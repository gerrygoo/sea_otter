import { describe, it, expect } from 'vitest';
import { buildGenerator } from './build';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, SetStructure, Modality } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Build Generator', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Technique,
    effortLevel: 5,
    strokePreferences: {
        [StrokeStyle.Free]: 3, [StrokeStyle.Back]: 3, [StrokeStyle.Breast]: 3, [StrokeStyle.Fly]: 3, [StrokeStyle.IM]: 3, [StrokeStyle.Drill]: 3, [StrokeStyle.Kick]: 3, [StrokeStyle.Pull]: 3
    },
    cssPace: 100
  };

  it('should generate a build set with special intensity label', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 600
    };

    const result = buildGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].structure).toBe(SetStructure.Build);
    expect(result![0].intensity).toBe('Z1 -> Z5');
  });

  it('should respect modality injection', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 600,
      modality: Modality.Kick
    };

    const result = buildGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].modality).toBe(Modality.Kick);
    expect(result![0].gearUsed).toContain('kickboard');
  });
});
