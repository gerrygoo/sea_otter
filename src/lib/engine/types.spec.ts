import { describe, it, expect } from 'vitest';
import type { SetGenerator, SwimSet, GeneratorContext, GeneratorConstraints } from './types';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';

describe('Engine Types & Interfaces', () => {
  it('should allow defining a valid SetGenerator', () => {
    const mockGenerator: SetGenerator = {
      name: 'Mock Generator',
      focusAlignment: {},
      generate: (context, constraints) => {
        // Simple logic: 100s on the minute until time runs out
        const repDuration = 60; // 1 minute
        const reps = Math.floor(constraints.timeBudgetSeconds / repDuration);
        
        if (reps < 1) return null;

        return [{
          reps,
          distance: 100,
          stroke: StrokeStyle.Free,
          description: 'Mock Set',
          intervalSeconds: 60
        }];
      }
    };

    const mockContext: GeneratorContext = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Endurance,
      effortLevel: 5
    };

    const mockConstraints: GeneratorConstraints = {
      timeBudgetSeconds: 600 // 10 minutes
    };

    const result = mockGenerator.generate(mockContext, mockConstraints);
    
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].reps).toBe(10); // 600 / 60 = 10
  });
});
