import { describe, it, expect } from 'vitest';
import { eq, callFresh, freshN, disj, conj, conde, Zzz, run, runStream } from './microkanren';
import type { Goal, Term } from './microkanren';

// Classic microKanren cons-list encoding: a pair is a 2-tuple [car, cdr],
// the empty list is `null`. These helpers (and appendo/membero below) are
// deliberately generic list plumbing, not swim-domain relations, so they
// live here as test fixtures rather than in relations.ts.
const nil: Term = null;

function cons(a: Term, b: Term): Term {
	return [a, b];
}
function list(...items: Term[]): Term {
	return items.reduceRight((tail: Term, head) => cons(head, tail), nil);
}
function asPair(term: unknown): [unknown, unknown] {
	if (!Array.isArray(term) || term.length !== 2) {
		throw new Error(`expected a cons pair, got ${JSON.stringify(term)}`);
	}
	return [term[0], term[1]];
}
function toArray(term: unknown): unknown[] {
	const out: unknown[] = [];
	let t = term;
	while (Array.isArray(t) && t.length === 2) {
		out.push(t[0]);
		t = t[1];
	}
	return out;
}

// appendo(l, s, out) <=> out is l appended with s. Only the recursive
// self-call is wrapped in Zzz, matching the plan's guidance: goal
// *invocation* is eager, so an unwrapped self-call would recurse (and
// overflow the stack) before `run` ever pulls a single value.
function appendo(l: Term, s: Term, out: Term): Goal {
	return disj(
		conj(eq(l, nil), eq(s, out)),
		callFresh((h) =>
			callFresh((t) =>
				callFresh((res) =>
					conj(
						eq(cons(h, t), l),
						conj(
							eq(cons(h, res), out),
							Zzz(() => appendo(t, s, res))
						)
					)
				)
			)
		)
	);
}

// membero(x, l) <=> x is a member of list l.
function membero(x: Term, l: Term): Goal {
	return callFresh((h) =>
		callFresh((t) =>
			conj(
				eq(cons(h, t), l),
				disj(
					eq(x, h),
					Zzz(() => membero(x, t))
				)
			)
		)
	);
}

// The standard hand-rolled-microKanren trap: without Zzz around the
// recursive call, invoking this goal recurses synchronously and blows the
// stack before `run` ever gets to pull a value.
function foreverO(x: Term): Goal {
	return disj(
		eq(x, 5),
		Zzz(() => foreverO(x))
	);
}

describe('microkanren core', () => {
	describe('eq', () => {
		it('unifies a fresh variable with a value', () => {
			const results = run(1, (q) => eq(q, 5));
			expect(results).toEqual([5]);
		});

		it('unifies two fresh variables together', () => {
			const results = run(1, (q) => callFresh((x) => conj(eq(x, 'a'), eq(q, x))));
			expect(results).toEqual(['a']);
		});

		it('fails when the values conflict', () => {
			const results = run(1, (q) => conj(eq(q, 1), eq(q, 2)));
			expect(results).toEqual([]);
		});
	});

	describe('conj / disj / conde', () => {
		it('conj narrows to values satisfying every goal', () => {
			const results = run(1, (q) => conj(eq(q, 1), eq(q, 1)));
			expect(results).toEqual([1]);
		});

		it('disj yields a result per successful branch', () => {
			const results = run(2, (q) => disj(eq(q, 1), eq(q, 2)));
			expect(results).toEqual([1, 2]);
		});

		it('conde ORs together ANDed clauses, tried in order', () => {
			const results = run(2, (q) => conde([eq(q, 1)], [eq(q, 2)]));
			expect(results).toEqual([1, 2]);
		});

		it('conde drops a clause whose goals internally conflict', () => {
			const results = run(2, (q) => conde([eq(q, 1), eq(q, 2)], [eq(q, 3)]));
			expect(results).toEqual([3]);
		});
	});

	describe('freshN', () => {
		it('introduces multiple fresh variables at once', () => {
			const results = run(1, (q) =>
				freshN(2, (a, b) => conj(eq(a, 1), conj(eq(b, 2), eq(q, cons(a, b)))))
			);
			expect(toArray(results[0])).toEqual([1, 2]);
		});
	});

	describe('appendo', () => {
		it('appends forward: given l and s, computes out', () => {
			const results = run(1, (q) => appendo(list(1, 2), list(3, 4), q));
			expect(toArray(results[0])).toEqual([1, 2, 3, 4]);
		});

		it('runs backward: given out, generates every (l, s) split', () => {
			const results = run(4, (q) =>
				callFresh((l) => callFresh((s) => conj(appendo(l, s, list(1, 2, 3)), eq(q, cons(l, s)))))
			);

			const splits = results.map((pair) => {
				const [l, s] = asPair(pair);
				return [toArray(l), toArray(s)];
			});

			expect(splits).toEqual([
				[[], [1, 2, 3]],
				[[1], [2, 3]],
				[[1, 2], [3]],
				[[1, 2, 3], []]
			]);
		});
	});

	describe('membero', () => {
		it('generates every element of a list', () => {
			const results = run(3, (q) => membero(q, list(1, 2, 3)));
			expect(results).toEqual([1, 2, 3]);
		});

		it('fails for a value not present in the list', () => {
			const results = run(1, (q) => conj(membero(q, list(1, 2, 3)), eq(q, 99)));
			expect(results).toEqual([]);
		});
	});

	describe('laziness (Zzz)', () => {
		it('pulls a finite number of results from an infinitely-recursive relation without overflowing the stack', () => {
			const results = run(3, (q) => foreverO(q));
			expect(results).toEqual([5, 5, 5]);
		});
	});

	describe('runStream', () => {
		it('exposes the same solutions as run, pulled lazily one at a time', () => {
			const stream = runStream((q) => disj(eq(q, 1), eq(q, 2)));

			const first = stream.next();
			const second = stream.next();
			const third = stream.next();

			expect(first.done).toBe(false);
			expect(second.done).toBe(false);
			expect(third.done).toBe(true);
		});

		it('is genuinely lazy: pulling one item from an infinite relation does not hang', () => {
			const stream = runStream((q) => foreverO(q));
			const first = stream.next();
			expect(first.done).toBe(false);
		});
	});
});
