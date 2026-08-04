// Search entry points: run the relations in relations.ts through
// microkanren.ts's trampoline and translate the result back into the
// SwimSet[] shape today's generators produce, so the two are directly
// comparable.
import { run } from './microkanren';
import type {
	GeneratorConstraints,
	GeneratorContext,
	StrokeStyle,
	SwimSet,
	Modality
} from '../engine/types';
import {
	activationCandidates,
	activationRelation,
	buildActivationSet,
	buildCooldownSet,
	buildLooseningSet,
	buildPrimingSet,
	cooldownCandidates,
	cooldownRelation,
	looseningCandidates,
	looseningRelation,
	primingCandidates,
	primingRelation,
	untuple
} from './relations';

function effectiveBudget(constraints: GeneratorConstraints, secondsPer100: number): number {
	if (constraints.distanceBudget !== undefined) return constraints.distanceBudget;
	return Math.floor(constraints.timeBudgetSeconds / secondsPer100) * 100;
}

// Returns the single most-preferred solution — same shape as
// protocolCooldownGenerator's output (one SwimSet) — for direct
// comparison. The full enumerated candidate space (useful for Track B's
// future visualization of the search itself) is available by calling
// `cooldownCandidates`/`cooldownRelation` directly with `run(n, ...)` for
// however many solutions are wanted.
export function searchCooldownSlot(
	context: GeneratorContext,
	constraints: GeneratorConstraints
): SwimSet[] {
	const candidates = cooldownCandidates(context, constraints);
	if (candidates.length === 0) return [];

	const [best] = run(1, (q) => cooldownRelation(q, candidates));
	const [reps, distance, stroke] = untuple(best, 3) as [number, number, StrokeStyle];
	return [buildCooldownSet(reps, distance, stroke)];
}

// Three independent per-phase searches, concatenated into one Workout
// slot's worth of sets — not a joint search across phases. Phases don't
// need to unify with each other (nothing in the domain rules requires
// phase 1's stroke to relate to phase 2's), and searching them jointly
// would multiply each phase's already-small domain into a space no longer
// practical to brute-force. The phase *proportions* (45%/35%/20%) stay
// fixed, matching today's generator; only each phase's own
// reps/distance/stroke/modality become real search axes.
export function searchWarmupSlot(
	context: GeneratorContext,
	constraints: GeneratorConstraints
): SwimSet[] {
	const isDistanceBased = constraints.distanceBudget !== undefined;
	const budget = effectiveBudget(constraints, 100);
	if (!isDistanceBased && constraints.timeBudgetSeconds < 300) return [];
	if (isDistanceBased && budget < 200) return [];

	const loosening = looseningCandidates(context, budget * 0.45);
	const activation = activationCandidates(context, budget * 0.35);
	const priming = primingCandidates(context, budget * 0.2);
	if (loosening.length === 0 || activation.length === 0 || priming.length === 0) return [];

	const [bestLoosening] = run(1, (q) => looseningRelation(q, loosening));
	const [bestActivation] = run(1, (q) => activationRelation(q, activation));
	const [bestPriming] = run(1, (q) => primingRelation(q, priming));

	const [looseningDistance, looseningStroke] = untuple(bestLoosening, 2) as [number, StrokeStyle];
	const [activationReps, activationStroke, activationModality] = untuple(bestActivation, 3) as [
		number,
		StrokeStyle,
		Modality.Drill | Modality.Swim
	];
	const [primingReps, primingStroke] = untuple(bestPriming, 2) as [number, StrokeStyle];

	return [
		buildLooseningSet(looseningDistance, looseningStroke),
		buildActivationSet(activationReps, activationStroke, activationModality),
		buildPrimingSet(primingReps, primingStroke, context.focus)
	];
}
