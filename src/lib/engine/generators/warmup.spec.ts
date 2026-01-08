import { describe, it, expect } from 'vitest';
import { mixedWarmupGenerator, pyramidWarmupGenerator } from './warmup';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '../types';
import type { GeneratorContext } from '../types';

describe('Warmup Generators', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: false },
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    strokePreferences: {
      Free: 5, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
    }
  };

  const constraints = { timeBudgetSeconds: 600 }; // 10 mins

  describe('mixedWarmupGenerator', () => {
    it('should generate a mix of Swim, Kick, Pull', () => {
      const result = mixedWarmupGenerator.generate(mockContext, constraints);
      expect(result).not.toBeNull();
      expect(result?.some(s => s.stroke === StrokeStyle.Free)).toBe(true);
      expect(result?.some(s => s.stroke === StrokeStyle.Kick)).toBe(true);
      expect(result?.some(s => s.stroke === StrokeStyle.Pull)).toBe(true);
    });

    it('should skip Kick if gear missing', () => {
      const noBoard = { ...mockContext, availableGear: { ...mockContext.availableGear, kickboard: false } };
      const result = mixedWarmupGenerator.generate(noBoard, constraints);
      expect(result?.some(s => s.stroke === StrokeStyle.Kick)).toBe(false);
    });
  });

  describe('pyramidWarmupGenerator', () => {
    it('should generate a pyramid structure', () => {
      const result = pyramidWarmupGenerator.generate(mockContext, constraints);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(3); // 100, 200, 100
      expect(result![1].distance).toBeGreaterThan(result![0].distance);
    });
  });
});
