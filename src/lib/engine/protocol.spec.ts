import { describe, it, expect } from 'vitest';
import { protocolWarmupGenerator } from './generators/protocol_warmup';
import { protocolCooldownGenerator } from './generators/protocol_cooldown';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, SetStructure } from './types';
import type { GeneratorContext, GeneratorConstraints } from './types';

describe('Structured Protocols', () => {
  const mockContext: GeneratorContext = {
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
    focus: TrainingFocus.Endurance,
    effortLevel: 5,
    strokePreferences: {
        [StrokeStyle.Free]: 3, [StrokeStyle.Back]: 3, [StrokeStyle.Breast]: 3, [StrokeStyle.Fly]: 3, [StrokeStyle.IM]: 3, [StrokeStyle.Drill]: 3, [StrokeStyle.Kick]: 3, [StrokeStyle.Pull]: 3
    },
    cssPace: 100
  };

  const constraints: GeneratorConstraints = {
    timeBudgetSeconds: 900 // 15 mins
  };

  describe('ProtocolWarmupGenerator', () => {
    it('should produce 3 phases (at least 3 sets)', () => {
      const result = protocolWarmupGenerator.generate(mockContext, constraints);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThanOrEqual(3);
      
      // Phase 1: Loosening
      expect(result![0].description).toContain('Loosening');
      // Phase 2: Activation
      expect(result![1].description).toContain('Activation');
      // Phase 3: Priming
      expect(result![2].description).toContain('Priming');
    });

    it('should use Build for Endurance focus', () => {
      const result = protocolWarmupGenerator.generate(mockContext, constraints);
      const primingSet = result!.find(s => s.description.includes('Priming'));
      expect(primingSet?.structure).toBe(SetStructure.Build);
    });

    it('should use Variable Speed for Speed focus', () => {
      const result = protocolWarmupGenerator.generate(
        { ...mockContext, focus: TrainingFocus.Speed },
        constraints
      );
      const primingSet = result!.find(s => s.description.includes('Priming'));
      expect(primingSet?.description).toContain('Variable Speed');
    });
  });

  describe('ProtocolCooldownGenerator', () => {
    it('should generate a Z1 cooldown', () => {
      const result = protocolCooldownGenerator.generate(mockContext, { timeBudgetSeconds: 300 });
      expect(result).not.toBeNull();
      expect(result![0].intensity).toBe('easy');
    });
  });
});
