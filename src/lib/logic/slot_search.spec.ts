import { describe, it, expect } from 'vitest';
import { searchCooldownSlot, searchWarmupSlot } from './slot_search';
import { PoolSizeUnit, StrokeStyle, TrainingFocus, SetStructure } from '../engine/types';
import type { GeneratorContext, GeneratorConstraints } from '../engine/types';

// Mirrors protocol.spec.ts's fixtures so the relational search's output
// shape is directly comparable to protocolCooldownGenerator/
// protocolWarmupGenerator's.
const mockContext: GeneratorContext = {
	poolSize: 25,
	poolUnit: PoolSizeUnit.Meters,
	availableGear: { fins: true, kickboard: true, pullBuoy: true, paddles: true, snorkel: true },
	focus: TrainingFocus.Endurance,
	effortLevel: 5,
	strokePreferences: {
		[StrokeStyle.Free]: 3,
		[StrokeStyle.Back]: 3,
		[StrokeStyle.Breast]: 3,
		[StrokeStyle.Fly]: 3,
		[StrokeStyle.IM]: 3,
		[StrokeStyle.Drill]: 3,
		[StrokeStyle.Kick]: 3,
		[StrokeStyle.Pull]: 3
	},
	cssPace: 100
};

const constraints: GeneratorConstraints = {
	timeBudgetSeconds: 900 // 15 mins
};

describe('searchCooldownSlot', () => {
	it('produces a Z1 cooldown set', () => {
		const result = searchCooldownSlot(mockContext, { timeBudgetSeconds: 300 });
		expect(result).toHaveLength(1);
		expect(result[0].intensity).toBe('easy');
		expect(result[0].reps).toBe(1);
		expect(result[0].distance).toBeGreaterThanOrEqual(100);
	});

	it('returns no solutions when the budget is below the minimum (a real backtracking-to-nothing case)', () => {
		expect(searchCooldownSlot(mockContext, { timeBudgetSeconds: 60 })).toEqual([]);
	});
});

describe('searchWarmupSlot', () => {
	it('produces 3 phases (loosening, activation, priming)', () => {
		const result = searchWarmupSlot(mockContext, constraints);
		expect(result).toHaveLength(3);
		expect(result[0].description).toContain('Loosening');
		expect(result[1].description).toContain('Activation');
		expect(result[2].description).toContain('Priming');
	});

	it('uses Build for Endurance focus', () => {
		const result = searchWarmupSlot(mockContext, constraints);
		const primingSet = result.find((s) => s.description.includes('Priming'));
		expect(primingSet?.structure).toBe(SetStructure.Build);
	});

	it('uses Variable Speed for Speed focus', () => {
		const result = searchWarmupSlot({ ...mockContext, focus: TrainingFocus.Speed }, constraints);
		const primingSet = result.find((s) => s.description.includes('Priming'));
		expect(primingSet?.description).toContain('Variable Speed');
	});

	it('returns no solutions when the budget is below the minimum', () => {
		expect(searchWarmupSlot(mockContext, { timeBudgetSeconds: 60 })).toEqual([]);
	});
});
