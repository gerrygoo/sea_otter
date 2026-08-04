import { describe, it, expect } from 'vitest';
import { run } from './microkanren';
import {
	activationCandidates,
	activationRelation,
	cooldownCandidates,
	cooldownRelation,
	looseningCandidates,
	looseningRelation,
	primingCandidates,
	primingRelation,
	untuple
} from './relations';
import { Modality, PoolSizeUnit, StrokeStyle, TrainingFocus } from '../engine/types';
import type { GeneratorContext } from '../engine/types';

const baseContext: GeneratorContext = {
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

describe('cooldown relation', () => {
	it('produces no candidates below the minimum budget', () => {
		expect(cooldownCandidates(baseContext, { timeBudgetSeconds: 60 })).toEqual([]);
		expect(cooldownCandidates(baseContext, { timeBudgetSeconds: 0, distanceBudget: 50 })).toEqual(
			[]
		);
	});

	it('orders candidates by stroke preference (descending), then distance (descending)', () => {
		const preferFly: GeneratorContext = {
			...baseContext,
			strokePreferences: { ...baseContext.strokePreferences, [StrokeStyle.Fly]: 5 }
		};
		const candidates = cooldownCandidates(preferFly, { timeBudgetSeconds: 600 });
		expect(candidates[0].stroke).toBe(StrokeStyle.Fly);
		// distances for the top stroke should themselves be descending
		const flyDistances = candidates
			.filter((c) => c.stroke === StrokeStyle.Fly)
			.map((c) => c.distance);
		expect(flyDistances).toEqual([...flyDistances].sort((a, b) => b - a));
	});

	it('the first conde solution matches the first (most preferred) candidate', () => {
		const candidates = cooldownCandidates(baseContext, { timeBudgetSeconds: 600 });
		const [first] = run(1, (q) => cooldownRelation(q, candidates));
		const [reps, distance, stroke] = untuple(first, 3);
		expect({ reps, distance, stroke }).toEqual(candidates[0]);
	});

	it('enumerates every candidate exactly once, in order', () => {
		const candidates = cooldownCandidates(baseContext, { timeBudgetSeconds: 600 });
		const results = run(candidates.length, (q) => cooldownRelation(q, candidates));
		const decoded = results.map((term) => {
			const [reps, distance, stroke] = untuple(term, 3);
			return { reps, distance, stroke };
		});
		expect(decoded).toEqual(candidates);
	});
});

describe('warmup phase relations', () => {
	it('loosening candidates cover every standard-multiple distance up to budget', () => {
		const candidates = looseningCandidates(baseContext, 275);
		const distances = [...new Set(candidates.map((c) => c.distance))];
		expect(distances).toEqual([250, 200, 150, 100]);
	});

	it('activation offers Drill before Swim only when Drill is actually available', () => {
		const withDrill = activationCandidates(baseContext, 350);
		expect(withDrill[0].modality).toBe(Modality.Drill);
		expect(withDrill.some((c) => c.modality === Modality.Swim)).toBe(true);

		const noDrillPrefs: GeneratorContext = {
			...baseContext,
			strokePreferences: { ...baseContext.strokePreferences, [StrokeStyle.Drill]: 1 }
		};
		const withoutDrill = activationCandidates(noDrillPrefs, 350);
		expect(withoutDrill.every((c) => c.modality === Modality.Swim)).toBe(true);
	});

	it('activation reps are bounded by budget / 50, minimum 2', () => {
		const candidates = activationCandidates(baseContext, 120);
		const reps = [...new Set(candidates.map((c) => c.reps))];
		expect(Math.max(...reps)).toBe(2); // floor(120/50) = 2
		expect(Math.min(...reps)).toBe(2);
	});

	it('priming reps are bounded by budget / 25, minimum 2', () => {
		const candidates = primingCandidates(baseContext, 100);
		const reps = [...new Set(candidates.map((c) => c.reps))];
		expect(Math.max(...reps)).toBe(4); // floor(100/25) = 4
	});

	it('the first solution for each phase relation matches the first candidate', () => {
		const loosening = looseningCandidates(baseContext, 275);
		const [firstLoosening] = run(1, (q) => looseningRelation(q, loosening));
		expect(untuple(firstLoosening, 2)).toEqual([loosening[0].distance, loosening[0].stroke]);

		const activation = activationCandidates(baseContext, 350);
		const [firstActivation] = run(1, (q) => activationRelation(q, activation));
		expect(untuple(firstActivation, 3)).toEqual([
			activation[0].reps,
			activation[0].stroke,
			activation[0].modality
		]);

		const priming = primingCandidates(baseContext, 100);
		const [firstPriming] = run(1, (q) => primingRelation(q, priming));
		expect(untuple(firstPriming, 2)).toEqual([priming[0].reps, priming[0].stroke]);
	});
});
