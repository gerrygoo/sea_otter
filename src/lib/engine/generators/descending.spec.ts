import { describe, it, expect } from 'vitest';
import { descendingGenerator } from './descending';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, SetStructure, Modality } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Descending Generator', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    strokePreferences: {
        [StrokeStyle.Free]: 3, [StrokeStyle.Back]: 3, [StrokeStyle.Breast]: 3, [StrokeStyle.Fly]: 3, [StrokeStyle.IM]: 3, [StrokeStyle.Drill]: 3, [StrokeStyle.Kick]: 3, [StrokeStyle.Pull]: 3
    },
    cssPace: 100
  };

  it('should generate a descending set with multiple SwimSets (one per rep)', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 600
    };

    const result = descendingGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(1);
    expect(result![0].structure).toBe(SetStructure.Descending);
    
    // Check that paces are descending (if CSS provided)
    if (mockContext.cssPace) {
        const paces = result!.map(s => s.targetPacePer100!);
        for (let i = 1; i < paces.length; i++) {
          expect(paces[i]).toBeLessThan(paces[i-1]);
        }
    }
  });

  it('should respect modality injection', () => {
    const constraints: GeneratorConstraints = {
      timeBudgetSeconds: 600,
      modality: Modality.Pull
    };

    const result = descendingGenerator.generate(mockContext, constraints);

    expect(result).not.toBeNull();
    expect(result![0].modality).toBe(Modality.Pull);
    expect(result![0].description).toContain('(Pull)');
  });
});
