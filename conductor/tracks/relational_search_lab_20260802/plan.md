> **STALE.** This plan predates an NFR-gathering session that revised its
> core decisions (compute engine, renderer, search strategy, core design,
> and scope). Read `HANDOFF.md` in this directory first — it supersedes
> the sections below wherever they conflict, and defines the next step
> (rewrite this file). Kept here for historical rationale only.

# Relational (miniKanren-style) workout search + live visualization

## Context

The current engine (`src/lib/engine`) generates workouts with a greedy
heuristic: a blueprint splits time/distance across warmup/mainSet/cooldown,
each slot tries generators in priority order and takes the first one that
returns a result, and the orchestrator patches up the output afterward
(distance top-off, mandatory-segment fallback) — see
`docs/ENGINE_REVIEW.md` for the full critique. When this project started,
the intent was to express workout generation relationally (miniKanren-
style: logic variables + constraints, satisfied via search), not
procedurally. Since latency is no longer a constraint here — as long as
the app can *show* the search happening — that original approach becomes
viable. This plan starts two tracks: (A) a relational search engine that
replaces one slot's generation with real constraint search, and (B) a
live visualization of that search, with WebGL as the target renderer for
the search tree.

**Decisions locked in with the user:**
- Build this as a **separate experimental surface** (`/lab` route), not a
  replacement of the live generator flow. The existing engine and UI are
  untouched.
- **Search granularity for v1 is per-slot**, not whole-workout-joint.
  Reasoning: the existing blueprint/budget split (`index.ts`) is already
  correct and tested — the part actually worth reformulating relationally
  is "given this slot's budget and constraints, which sets satisfy
  everything," which is exactly the scope of today's `fillSlot`/
  `SetGenerator.generate()`. This keeps the search space (and thus the
  visualized tree) small enough to stay legible and performant in WebGL,
  keeps the new relational core easy to validate for correctness on a
  small problem, and composes cleanly into a whole-workout joint search
  later if wanted (the relations themselves don't change, just how many
  slots' logic variables get unified in one `run` call).
- **microKanren core: hand-rolled.** Searched for existing JS/TS
  implementations first: `kanren` (npm) is a TS-flavored microKanren port
  but unmaintained for 7 years with zero dependents; `ramo` (wjlewis) is a
  small, low-activity hobby port with no strong maintenance signal;
  `reactiveKanren` (Donahue, ICFP 2024 — "miniKanren for the Web") is the
  closest in spirit (its reactive-unification idea is directly relevant to
  visualizing search evolving over time) but is an explicitly-labeled
  research prototype, not published to npm, and not something to depend on
  for a real build. None is a clean, current, well-typed fit, so per the
  agreed fallback we hand-roll our own. `reactiveKanren`'s paper is worth
  reading for inspiration on the visualization side.

## Scope of this pass

Both tracks are large; this plan delivers one real, reviewable, testable
slice through both rather than the full domain:

1. A correct, tested microKanren core.
2. Real relations + search for **one slot** (cooldown — smallest, fewest
   constraints) that can produce actual `SwimSet[]` solutions comparable to
   today's `protocolCooldownGenerator`.
3. A `/lab` route with a working WebGL2 renderer of that search's live
   event stream (tree of choice points, color-coded by state), plus basic
   stats and playback controls.

Explicitly **not** in this pass (call out as next steps once this lands):
expanding relations to mainSet/warmup, whole-workout joint search, a
polished force-directed layout, pan/zoom/node-inspection interactions, and
wiring the relational engine into the main generator flow.

## Track A — Relational search core & slot relations

**New module: `src/lib/logic/`** (plain TypeScript, no Svelte — matches
`src/lib/engine`'s framework-free convention so it's independently
testable and portable).

- `microkanren.ts` — the relational core: logic variables, a substitution
  (association list), `walk`/`unify`, `callFresh`/`freshN`, `conj`/`disj`/
  `conde`, and `run`/`runStream` entry points. Streams are implemented as
  **JS generators**, which gives lazy/interleaved search "for free": a
  generator function *call* does not execute its body until `.next()` is
  pulled, so `mplus`/`bind` (the classic microKanren stream-combination
  algorithm) can be written directly as `function*` bodies and the
  interleaving happens naturally at each `.next()` boundary — this is also
  exactly the "steppable" property Track B needs, with no extra
  instrumentation required at the core level.

  **Important correctness trap to get right (and test for):** goal
  *invocation* (calling a `Goal` function to get back a `Stream`) is
  eager, even though generator *bodies* are lazy. A naive recursive
  relation (e.g. `disj(eq(x, 5), (state) => recurse(x)(state))`) will
  blow the call stack immediately on `run`, before any generator is even
  produced, because calling the goal calls the relation function again
  synchronously. The standard microKanren fix is a `Zzz`/delay combinator:
  wrap recursive self-calls so invocation is deferred into a generator
  body (which only runs on `.next()`):
  ```ts
  function Zzz(goalThunk: () => Goal): Goal {
    return (state) => (function* () { yield* goalThunk()(state); })();
  }
  ```
  `appendo`/`membero` (used for the correctness tests below) must use this
  for their recursive calls. Include a laziness regression test: an
  infinitely-recursive relation (e.g. `foreverO(x) = disj(eq(x,5),
  Zzz(() => foreverO(x)))`) pulled through `run(3, ...)` must terminate
  and return `[5, 5, 5]` without stack overflow or hanging — this is the
  standard trap in hand-rolled microKanren and the most valuable test to
  get right early.

  - Validate the core against classic, well-known relations (`appendo`,
    `membero`) — the standard way to sanity-check a from-scratch
    microKanren independent of the swim domain.

- `relations.ts` — domain relations for a single slot, built on top of
  **existing** engine types and helpers rather than duplicating them:
  reuse `GeneratorContext`, `GeneratorConstraints`, `SwimSet` from
  `src/lib/engine/types.ts`, and wrap existing predicate logic
  (`isModalityAvailable` from `modality.ts`, `getAvailableStrokes` from
  `utils.ts`) as goals instead of re-deriving them relationally.
  Important scoping choice: logic variables represent the **combinatorial
  choices** (rep count from a small bounded domain, distance from a small
  set of standard values, stroke, modality, structure) — not raw
  arithmetic. Plain miniKanren's relational arithmetic (Peano-style) does
  not scale to real distances/durations, and building a full CLP(FD)
  layer is out of scope here, so budget/duration sums are checked as
  ordinary JS predicate goals over already-unified small-domain values,
  not unified themselves. This is the pragmatic middle ground between
  "fully relational" and "fully procedural."

- `slot_search.ts` — `searchCooldownSlot(context, constraints)`: runs the
  relations through `microkanren.ts`, translating today's soft
  `focusAlignment` preference ordering into `conde` branch order (first
  branch tried = most preferred), and returns solutions as `SwimSet[]`,
  shaped identically to what `protocolCooldownGenerator` produces today so
  the two are directly comparable.

- Specs co-located per this repo's convention (`*.spec.ts`), following the
  existing generator spec style (see e.g. `generators/hypoxic.spec.ts` —
  construct a `GeneratorContext`/`GeneratorConstraints`, assert on
  results).

## Track B — Live visualization

**New route: `src/routes/lab/+page.svelte`**, added as a fourth tab in
`src/lib/components/Navigation.svelte` ("Lab") so it's reachable, but
free to have its own visual language rather than matching the swim-app's
brutalist form styling — this is a console/instrument, not a workout
screen.

- `src/lib/stores/lab_search.ts` — Svelte 5 runes-based state holding the
  live tree (nodes/edges derived from a `SearchEvent` stream), running
  stats (attempts, backtracks, depth, solutions found), and playback
  controls (pause/resume/speed). Note: `SearchEvent` tracing is a thin
  wrapper *around* `microkanren.ts`'s goals (built in `slot_search.ts` or
  a small tracing layer), not baked into the pure core — keeps the core
  testable against textbook semantics without conflating visualization
  concerns. The engine's generator is pumped via `requestAnimationFrame`,
  batching N events per frame — keeps the tab responsive and produces a
  genuinely animated "watch it think" effect rather than a blocking
  run-to-completion dump.

- `src/lib/components/lab/SearchTreeCanvas.svelte` — a real (intentionally
  simple for v1) WebGL2 renderer: nodes as instanced points, edges as
  lines, both positioned via a cheap CPU-side tree layout (tidy-tree; the
  per-slot tree is small enough that layout cost is negligible) and
  recomputed incrementally as new events arrive. Color/opacity encodes
  state (pending / succeeded / failed-and-backtracked / part of a found
  solution). No 3D engine dependency (no three.js) for v1 — hand-rolled
  WebGL2 keeps this consistent with the rest of the project's minimal-
  dependency footprint and is enough for a 2D point/line tree; revisit if
  v2 wants richer interaction (pan/zoom, 3D layout).

- Minimal controls on the `/lab` page: reuse a trimmed parameter form
  (pool size, focus, stroke prefs, gear — the subset `searchCooldownSlot`
  actually consumes) to kick off a search, then the canvas + a stats
  strip (attempts / backtracks / solutions found) + play/pause/speed.

## Verification

- `npm run test:unit` — new specs for `microkanren.ts` (against
  `appendo`/`membero`/laziness), `relations.ts`, and `slot_search.ts`
  should pass and exercise both successful search and
  backtracking/no-solution cases.
- `npm run check` / `npm run lint` clean on the new files.
- Manual: `npm run dev`, navigate to `/lab`, submit the trimmed form, and
  confirm the WebGL canvas animates a growing/backtracking tree in real
  time, stats update live, and a final set of cooldown-slot solutions is
  displayed — compare a solution against `protocolCooldownGenerator`'s
  output for the same inputs to sanity-check correctness.
