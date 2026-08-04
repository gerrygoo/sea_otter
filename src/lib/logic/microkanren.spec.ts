import { describe, it, expect } from 'vitest';
import { eq, callFresh, freshN, disj, conj, conde, delay, run, runStream } from './microkanren';
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
	if (t !== null) out.push(t); // dotted pair: non-nil, non-list tail
	return out;
}

// appendo(l, s, out) <=> out is l appended with s. Unlike the first,
// superseded design, the recursive self-call here needs no `delay` wrapper:
// it's nested inside `callFresh`'s lambda, which the trampoline never
// invokes at construction time (only when it actually pops the
// corresponding job) — that's already enough of a laziness boundary.
function appendo(l: Term, s: Term, out: Term): Goal {
	return disj(
		conj(eq(l, nil), eq(s, out)),
		callFresh((h) =>
			callFresh((t) =>
				callFresh((res) => conj(eq(cons(h, t), l), conj(eq(cons(h, res), out), appendo(t, s, res))))
			)
		)
	);
}

// membero(x, l) <=> x is a member of list l. Same reasoning as appendo: the
// recursive call is guarded by the enclosing callFresh lambdas.
function membero(x: Term, l: Term): Goal {
	return callFresh((h) => callFresh((t) => conj(eq(cons(h, t), l), disj(eq(x, h), membero(x, t)))));
}

// foreverO has no callFresh (or any other lambda) between its own name and
// its recursive self-reference — it recurses as a bare argument to `disj`.
// JS evaluates call arguments eagerly regardless of how a Goal is
// represented internally, so calling `foreverO(x)` to build disj's second
// argument would call `foreverO(x)` again to produce that argument's value,
// forever, before `disj` itself is ever reached — a construction-time stack
// overflow, not a search-time one. `delay` defers that specific call until
// the trampoline actually pops the job, which is the one place in this
// core's design where an explicit deferral combinator is still required.
function foreverO(x: Term): Goal {
	return disj(
		eq(x, 5),
		delay(() => foreverO(x))
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

		it('conde preserves clause order across 3+ clauses under the FIFO trampoline', () => {
			// Regression test: a left-associated disj/conj fold interleaves
			// breadth-first across the whole chain before reaching later
			// terminal goals, which reorders solutions away from clause order
			// once there are 3+ clauses (2-clause cases can't catch this,
			// since a 2-element fold has only one possible associativity).
			const results = run(4, (q) => conde([eq(q, 1)], [eq(q, 2)], [eq(q, 3)], [eq(q, 4)]));
			expect(results).toEqual([1, 2, 3, 4]);
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

	describe('laziness (delay)', () => {
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
