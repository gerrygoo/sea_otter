import { describe, it, expect } from 'vitest';
import { pyramidGenerator, ladderGenerator } from './patterns';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '../types';
import type { GeneratorContext, GeneratorConstraints } from '../types';

describe('Pattern Generators', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: TrainingFocus.Aerobic,
    effortLevel: 5
  };

  describe('Pyramid Generator', () => {
    it('should generate a pyramid set (100, 200, 300, 200, 100) if time allows', () => {
      const constraints: GeneratorConstraints = {
        timeBudgetSeconds: 1800 // 30 minutes, plenty of time
      };

      const result = pyramidGenerator.generate(mockContext, constraints);

      expect(result).not.toBeNull();
      // A standard 1-2-3-2-1 pyramid is 5 items
      expect(result).toHaveLength(5);
      expect(result![0].distance).toBe(100);
      expect(result![2].distance).toBe(300);
      expect(result![4].distance).toBe(100);
    });

    it('should return null if time budget is too small', () => {
      const constraints: GeneratorConstraints = {
        timeBudgetSeconds: 60 // Too short for a pyramid
      };

      const result = pyramidGenerator.generate(mockContext, constraints);

      expect(result).toBeNull();
    });
  });

  describe('Ladder Generator', () => {
    it('should generate a ladder set (100, 200, 300, 400) if time allows', () => {
      const constraints: GeneratorConstraints = {
        timeBudgetSeconds: 1800 
      };

      const result = ladderGenerator.generate(mockContext, constraints);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);
      expect(result![0].distance).toBe(100);
      expect(result![3].distance).toBe(400);
    });
  });
});
