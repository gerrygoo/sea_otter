// Continuation/task-based microKanren core. Goals and search state are flat
// data; an explicit trampoline (a queue of pending jobs) drives expansion
// instead of the JS call stack recursing through nested stream combinators.

export interface Var {
	readonly tag: 'var';
	readonly id: number;
}

export type Term = Var | null | number | string | boolean | Term[];

export type Goal =
	| { tag: 'eq'; a: Term; b: Term }
	| { tag: 'callFresh'; f: (v: Var) => Goal }
	| { tag: 'disj'; g1: Goal; g2: Goal }
	| { tag: 'conj'; g1: Goal; g2: Goal }
	| { tag: 'delay'; thunk: () => Goal };

type Subst = ReadonlyMap<number, Term>;

interface State {
	readonly subst: Subst;
	readonly counter: number;
}

export function eq(a: Term, b: Term): Goal {
	return { tag: 'eq', a, b };
}

export function callFresh(f: (v: Var) => Goal): Goal {
	return { tag: 'callFresh', f };
}

export function disj(g1: Goal, g2: Goal): Goal {
	return { tag: 'disj', g1, g2 };
}

export function conj(g1: Goal, g2: Goal): Goal {
	return { tag: 'conj', g1, g2 };
}

// Guards a directly self-recursive goal reference against JS's eager
// argument evaluation. Only needed at call sites where a relation refers to
// itself as a bare combinator argument (e.g. `disj(base, recurse())`) with
// no intervening `callFresh`/`freshN` lambda to act as a natural thunk
// boundary — `callFresh`'s `f` is never invoked at construction time, so a
// recursive call nested inside one (as in `appendo`/`membero` below) is
// already deferred and needs no extra wrapping. `delay` exists for the rarer
// case (see `foreverO` in the spec) where no such lambda exists to defer
// through. This is unrelated to search-time stack safety: the trampoline
// (see `step`/`run` below) drives expansion through an explicit queue, so
// recursion depth during search never grows the JS call stack regardless of
// whether a goal uses `delay`.
export function delay(thunk: () => Goal): Goal {
	return { tag: 'delay', thunk };
}

export function freshN(n: number, f: (...vars: Var[]) => Goal): Goal {
	function go(remaining: number, acc: Var[]): Goal {
		if (remaining === 0) return f(...acc);
		return callFresh((v) => go(remaining - 1, [...acc, v]));
	}
	return go(n, []);
}

export function conde(...clauses: Goal[][]): Goal {
	const conjoined = clauses.map((clause) => clause.reduce((acc, g) => conj(acc, g)));
	return conjoined.reduce((acc, g) => disj(acc, g));
}

function isVar(t: Term): t is Var {
	return typeof t === 'object' && t !== null && !Array.isArray(t) && t.tag === 'var';
}

function walk(t: Term, subst: Subst): Term {
	while (isVar(t)) {
		const bound = subst.get(t.id);
		if (bound === undefined) break;
		t = bound;
	}
	return t;
}

function unify(a: Term, b: Term, subst: Subst): Subst | null {
	const wa = walk(a, subst);
	const wb = walk(b, subst);
	if (isVar(wa) && isVar(wb) && wa.id === wb.id) return subst;
	if (isVar(wa)) return new Map(subst).set(wa.id, wb);
	if (isVar(wb)) return new Map(subst).set(wb.id, wa);
	if (Array.isArray(wa) && Array.isArray(wb)) {
		const s1 = unify(wa[0], wb[0], subst);
		if (s1 === null) return null;
		return unify(wa[1], wb[1], s1);
	}
	if (Array.isArray(wa) || Array.isArray(wb)) return null;
	return wa === wb ? subst : null;
}

function deepWalk(t: Term, subst: Subst): unknown {
	const w = walk(t, subst);
	if (Array.isArray(w)) return [deepWalk(w[0], subst), deepWalk(w[1], subst)];
	return w;
}

// A `Cont` is the list of conjuncts still owed after the current goal
// succeeds — conj(g1, g2) proceeds by solving g1 then, for whichever state(s)
// that produces, continuing with g2. Kept as flat data (not a closure) so a
// job is fully serializable, per the plan's continuation-based core.
type Cont = null | { goal: Goal; next: Cont };

interface Job {
	goal: Goal;
	state: State;
	cont: Cont;
}

// Returns the resulting state when a goal succeeds and no conjunct remains
// (a full solution), or `undefined` when the job instead pushed follow-up
// work onto the queue.
function continueWith(state: State, cont: Cont, queue: Job[]): State | undefined {
	if (cont === null) return state;
	queue.push({ goal: cont.goal, state, cont: cont.next });
	return undefined;
}

// Processes exactly one job: O(1) work, pushing zero or more follow-up jobs
// onto the queue rather than recursing. This is what makes the trampoline
// stack-safe regardless of search depth — a relation that recurses a
// thousand levels deep just means a thousand queue iterations, not a
// thousand nested JS calls.
function step(job: Job, queue: Job[]): State | undefined {
	const { goal, state, cont } = job;
	switch (goal.tag) {
		case 'eq': {
			const subst2 = unify(goal.a, goal.b, state.subst);
			if (subst2 === null) return undefined;
			return continueWith({ subst: subst2, counter: state.counter }, cont, queue);
		}
		case 'callFresh': {
			const v: Var = { tag: 'var', id: state.counter };
			const goal2 = goal.f(v);
			queue.push({ goal: goal2, state: { subst: state.subst, counter: state.counter + 1 }, cont });
			return undefined;
		}
		case 'disj': {
			queue.push({ goal: goal.g1, state, cont });
			queue.push({ goal: goal.g2, state, cont });
			return undefined;
		}
		case 'conj': {
			queue.push({ goal: goal.g1, state, cont: { goal: goal.g2, next: cont } });
			return undefined;
		}
		case 'delay': {
			queue.push({ goal: goal.thunk(), state, cont });
			return undefined;
		}
	}
}

export function runStream(build: (q: Var) => Goal): Generator<unknown> {
	const q: Var = { tag: 'var', id: 0 };
	const initialState: State = { subst: new Map(), counter: 1 };
	const queue: Job[] = [{ goal: build(q), state: initialState, cont: null }];

	function* generate(): Generator<unknown> {
		while (queue.length > 0) {
			const job = queue.shift()!;
			const solution = step(job, queue);
			if (solution !== undefined) yield deepWalk(q, solution.subst);
		}
	}

	return generate();
}

export function run(n: number, build: (q: Var) => Goal): unknown[] {
	const results: unknown[] = [];
	for (const value of runStream(build)) {
		results.push(value);
		if (results.length >= n) break;
	}
	return results;
}
