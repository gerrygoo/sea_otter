// Domain relations for cooldown and warmup, built on top of existing engine
// types/helpers rather than re-deriving them. Logic variables represent
// bounded combinatorial choices (reps, distance, stroke) — not raw
// arithmetic — so budget/gear/modality validity is checked as an ordinary
// JS predicate over each candidate *before* it's offered to the relational
// core, not unified itself (a full CLP(FD) layer is out of scope here, per
// the plan). The relational core's job is the search/selection itself:
// enumerating candidates via `conde`, in an order where the first (most
// preferred) branch matches — as closely as a real search can — what
// today's deterministic generator would have produced.
import { conde, eq, type Goal, type Term, type Var } from './microkanren';
import {
	Modality,
	SetStructure,
	StrokeStyle,
	TrainingFocus,
	type GeneratorConstraints,
	type GeneratorContext,
	type StrokePreferences,
	type SwimSet
} from '../engine/types';
import { estimateDistanceDuration, getAvailableStrokes } from '../engine/utils';
import { isModalityAvailable } from '../engine/modality';
import { EffortIntensity, getBuildIntensityLabel } from '../engine/pace_logic';

// A cons-list tuple encoding for candidate fields, so a single `eq` unifies
// an entire candidate at once. Field order matters only for encode/decode
// symmetry — it carries no ordering meaning of its own (candidate order in
// the `conde` clauses is what encodes preference).
export function tuple(...fields: Term[]): Term {
	return fields.reduceRight((tail: Term, head) => [head, tail], null as Term);
}

export function untuple(term: unknown, length: number): unknown[] {
	const out: unknown[] = [];
	let t = term;
	for (let i = 0; i < length; i++) {
		if (!Array.isArray(t) || t.length !== 2) {
			throw new Error(`expected a ${length}-field tuple, got ${JSON.stringify(term)}`);
		}
		out.push(t[0]);
		t = t[1];
	}
	return out;
}

function rangeDesc(min: number, max: number, step: number): number[] {
	const out: number[] = [];
	for (let v = max; v >= min; v -= step) out.push(v);
	return out;
}

// Mirrors `pickStroke`'s weighting (higher preference = more likely) as a
// deterministic preference order instead of a random pick: descending by
// weight, ties broken by the input's original order (`Array.prototype.sort`
// is stable), so the most-preferred stroke is always the first branch
// `conde` tries.
function orderByPreference(prefs: StrokePreferences, strokes: StrokeStyle[]): StrokeStyle[] {
	return [...strokes].sort(
		(a, b) =>
			(prefs[b as keyof StrokePreferences] ?? 0) - (prefs[a as keyof StrokePreferences] ?? 0)
	);
}

function effectiveBudget(constraints: GeneratorConstraints, secondsPer100: number): number {
	if (constraints.distanceBudget !== undefined) return constraints.distanceBudget;
	return Math.floor(constraints.timeBudgetSeconds / secondsPer100) * 100;
}

export interface CooldownCandidate {
	reps: number;
	distance: number;
	stroke: StrokeStyle;
}

// Distance/stroke are the real search axes here; reps/modality/structure
// have exactly one valid value for a cooldown today, so — per the plan's
// scoping — they're assigned directly rather than run through a degenerate
// one-option relational choice.
export function cooldownCandidates(
	context: GeneratorContext,
	constraints: GeneratorConstraints
): CooldownCandidate[] {
	const isDistanceBased = constraints.distanceBudget !== undefined;
	const budget = effectiveBudget(constraints, 110);
	if (!isDistanceBased && constraints.timeBudgetSeconds < 120) return [];
	if (isDistanceBased && budget < 100) return [];

	const maxDistance = Math.max(100, Math.floor(budget / 50) * 50);
	const distances = rangeDesc(100, maxDistance, 50);

	const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
	const availableStrokes = getAvailableStrokes(context.strokePreferences, [
		...standardStrokes,
		StrokeStyle.Choice
	]);
	const strokes = orderByPreference(context.strokePreferences, availableStrokes);

	const candidates: CooldownCandidate[] = [];
	for (const stroke of strokes) {
		for (const distance of distances) {
			candidates.push({ reps: 1, distance, stroke });
		}
	}
	return candidates;
}

export function cooldownRelation(q: Var, candidates: CooldownCandidate[]): Goal {
	return conde(...candidates.map((c): Goal[] => [eq(q, tuple(c.reps, c.distance, c.stroke))]));
}

export function buildCooldownSet(reps: number, distance: number, stroke: StrokeStyle): SwimSet {
	return {
		reps,
		distance,
		stroke,
		description: `Cooldown: Easy ${stroke} Swim (Double Arm Backstroke recommended)`,
		intensity: EffortIntensity.Easy,
		intervalSeconds: estimateDistanceDuration(distance, 110),
		structure: SetStructure.Basic,
		modality: Modality.Swim
	};
}

export interface LooseningCandidate {
	distance: number;
	stroke: StrokeStyle;
}

export interface ActivationCandidate {
	reps: number;
	stroke: StrokeStyle;
	modality: Modality.Drill | Modality.Swim;
}

export interface PrimingCandidate {
	reps: number;
	stroke: StrokeStyle;
}

export function looseningCandidates(
	context: GeneratorContext,
	budget: number
): LooseningCandidate[] {
	const maxDistance = Math.max(100, Math.floor(budget / 50) * 50);
	const distances = rangeDesc(100, maxDistance, 50);
	const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
	const available = getAvailableStrokes(context.strokePreferences, [
		...standardStrokes,
		StrokeStyle.Choice
	]);
	const strokes = orderByPreference(context.strokePreferences, available);

	const candidates: LooseningCandidate[] = [];
	for (const stroke of strokes) {
		for (const distance of distances) {
			candidates.push({ distance, stroke });
		}
	}
	return candidates;
}

export function looseningRelation(q: Var, candidates: LooseningCandidate[]): Goal {
	return conde(...candidates.map((c): Goal[] => [eq(q, tuple(c.distance, c.stroke))]));
}

export function buildLooseningSet(distance: number, stroke: StrokeStyle): SwimSet {
	return {
		reps: 1,
		distance,
		stroke,
		description: `Loosening: Easy ${stroke} Swim`,
		intensity: EffortIntensity.Easy,
		intervalSeconds: estimateDistanceDuration(distance, 100),
		structure: SetStructure.Basic,
		modality: Modality.Swim
	};
}

// `isModalityAvailable`/gear checks decide which modalities are even
// *offered* as candidates: Drill is only a real option when the swimmer's
// prefs allow it, matching today's generator's intent but — unlike
// today's generator, which applies Drill unconditionally — actually
// enforcing it (see HANDOFF.md's note on ENGINE_REVIEW.md's "correct by
// construction" gap).
export function activationCandidates(
	context: GeneratorContext,
	budget: number
): ActivationCandidate[] {
	const repDistance = 50;
	const maxReps = Math.max(2, Math.floor(budget / repDistance));
	const repsOptions = rangeDesc(2, maxReps, 1);

	const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
	const available = getAvailableStrokes(context.strokePreferences, standardStrokes);
	const strokes = orderByPreference(context.strokePreferences, available);

	const modalities: (Modality.Drill | Modality.Swim)[] = isModalityAvailable(
		context,
		Modality.Drill
	)
		? [Modality.Drill, Modality.Swim]
		: [Modality.Swim];

	const candidates: ActivationCandidate[] = [];
	for (const modality of modalities) {
		for (const stroke of strokes) {
			for (const reps of repsOptions) {
				candidates.push({ reps, stroke, modality });
			}
		}
	}
	return candidates;
}

export function activationRelation(q: Var, candidates: ActivationCandidate[]): Goal {
	return conde(...candidates.map((c): Goal[] => [eq(q, tuple(c.reps, c.stroke, c.modality))]));
}

export function buildActivationSet(
	reps: number,
	stroke: StrokeStyle,
	modality: Modality.Drill | Modality.Swim
): SwimSet {
	const isDrill = modality === Modality.Drill;
	return {
		reps,
		distance: 50,
		stroke,
		description: isDrill
			? `Activation: 25 Kick / 25 Drill (${stroke}) (Drill)`
			: `Activation: Easy ${stroke} Swim`,
		intensity: EffortIntensity.Easy,
		intervalSeconds: 60,
		structure: SetStructure.Basic,
		modality
	};
}

export function primingCandidates(context: GeneratorContext, budget: number): PrimingCandidate[] {
	const repDistance = 25;
	const maxReps = Math.max(2, Math.floor(budget / repDistance));
	const repsOptions = rangeDesc(2, maxReps, 1);

	const standardStrokes = [StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly];
	const available = getAvailableStrokes(context.strokePreferences, standardStrokes);
	const strokes = orderByPreference(context.strokePreferences, available);

	const candidates: PrimingCandidate[] = [];
	for (const stroke of strokes) {
		for (const reps of repsOptions) {
			candidates.push({ reps, stroke });
		}
	}
	return candidates;
}

export function primingRelation(q: Var, candidates: PrimingCandidate[]): Goal {
	return conde(...candidates.map((c): Goal[] => [eq(q, tuple(c.reps, c.stroke))]));
}

// Speed-vs-Build is forced by `context.focus`, an input known up front, not
// a search axis — so it's a plain JS branch on an already-known value, same
// as today's generator, not a relational choice.
export function buildPrimingSet(reps: number, stroke: StrokeStyle, focus: TrainingFocus): SwimSet {
	if (focus === TrainingFocus.Speed) {
		return {
			reps,
			distance: 25,
			stroke,
			description: `Priming: Variable Speed (12.5 Fast / 12.5 Easy) - ${stroke}`,
			intensity: EffortIntensity.MaxEffort,
			intervalSeconds: 40,
			structure: SetStructure.Basic,
			modality: Modality.Swim
		};
	}
	return {
		reps,
		distance: 25,
		stroke,
		description: `Priming: 25m Build (Acceleration) - ${stroke}`,
		intensity: getBuildIntensityLabel(),
		intervalSeconds: 40,
		structure: SetStructure.Build,
		modality: Modality.Swim
	};
}
