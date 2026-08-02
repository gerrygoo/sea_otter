# Relational (miniKanren-style) workout search + live visualization

## Context

The current engine (`src/lib/engine`) generates workouts with a greedy
heuristic: a blueprint splits time/distance across warmup/mainSet/cooldown,
each slot tries generators in priority order and takes the first one that
returns a result, and the orchestrator patches up the output afterward —
see `docs/ENGINE_REVIEW.md` for the full critique. The intent, revived now
that generation latency is not a constraint, is to express workout
generation *relationally* (miniKanren-style: logic variables + constraints,
solved via search) instead of procedurally, on a separate experimental
`/lab` route, without touching the existing generator flow or UI.

This is the second revision of this plan. The first (superseded) version
proposed a single hand-rolled, generator/closure-based microKanren core,
a small single-threaded search visualized in WebGL2, and one `/lab` view.
An NFR-gathering session changed the requirements substantially — real
hardware parallelism ("use as much compute power as is reasonable"), and
a live-tuning UX (change input parameters, watch a large candidate
population update in place, not click-to-regenerate) — and this revision
reflects the design that followed from those requirements. See git
history for the first version if the prior rationale is useful context.

## Decisions locked in with the user

- **Two views on `/lab`, not one.** Brute-force GPU search (below) has no
  backtracking to show — every candidate is evaluated independently and
  simultaneously. That's a different visual identity than "watch a search
  tree grow/backtrack." Rather than pick one:
  - **Small view:** a genuinely small, single-threaded, sequential
    backtracking search with real choice points and real retreat-on-
    failure — the original "watch it think" pitch, essentially unchanged.
  - **Large view:** GPU-primary bulk evaluation of a large candidate
    population, live-refiltered against current input parameters as they
    change.

  Both views validate candidates against the *same* domain rules (budget,
  focus alignment, gear, stroke preferences), implemented twice — TS
  goals for the small view, WGSL for the large view, since WGSL can't
  share code with TypeScript. Accepted, ongoing cost: keep one canonical
  written spec (this doc + tests) both implementations are held to.

- **Search granularity stays per-slot, not whole-workout-joint.** Each
  slot (cooldown, warmup) is searched independently; nothing here unifies
  logic variables jointly across slots. This is what keeps "more slots"
  additive rather than combinatorially multiplicative.

- **Slots for this pass: cooldown and warmup.** Cooldown was chosen
  first for being smallest; warmup is added this pass per the NFR
  session's scope decision. `mainSet` and joint whole-workout search are
  explicitly out of scope, as before.

- **microKanren core: hand-rolled, continuation/task-based (not
  closures/generators).** The first version's design — `Goal =
  (State) => Stream`, implemented with JS generators, `Zzz` as a delay
  combinator to avoid stack overflow on eager goal invocation — is
  superseded. Goal invocation being a real JS function call recursing
  through the JS call stack was specific to that design; a continuation/
  task-based core (goals and search state as flat, serializable data, an
  explicit trampoline driving expansion instead of the JS call stack)
  likely makes that trap — and `Zzz` itself — unnecessary. Confirm this
  by construction (write the laziness regression test first) rather than
  assuming; if a stack-safety trap turns out to still exist in some form,
  handle it then. This core only drives the **small view** directly; the
  large view's WGSL is a separate implementation of the same domain rules
  (see above).

- **Compute engine: WebGPU-primary for the large view. No CPU worker
  parallelism this pass.** `SharedArrayBuffer` + `Atomics` (shared-memory
  CPU work-stealing) was considered and dropped: GPU compute (thousands
  of SIMT threads) is a much bigger parallelism lever than a CPU worker
  pool for this workload's shape (bounded, small-domain combinatorial
  candidates), and dropping CPU workers also drops the need for
  cross-origin-isolation headers, which this repo's GitHub Pages hosting
  (`adapter-static`, see `.github/workflows/deploy.yml`) cannot serve
  natively. Revisit CPU workers only if a future pass needs them.

- **Large view search strategy: brute-force enumeration, not
  bulk-synchronous wave expansion.** WGSL has no recursion, no dynamic
  allocation, and WebGPU has no dynamic kernel launch, so literal
  one-node-at-a-time backtracking doesn't map to the hardware regardless
  of strategy. Between the two GPU-friendly alternatives, brute force
  wins for this domain: cooldown's enriched domain and warmup's
  per-phase domains (both below) land in the **thousands** of candidates,
  nowhere near where full enumeration becomes impractical (that threshold
  is in the millions+). Brute force also makes "rapid update on parameter
  change" close to free — enumeration doesn't depend on the input
  parameters at all, only the pass/fail/score check does, so the
  candidate buffer is generated once and stays resident; a parameter
  change is a small uniform-buffer write plus a redispatch of the
  filter/score pass.

- **Renderer: WebGPU, not WebGL2 — one unified GPU context shared by
  compute and render.** The first version chose hand-rolled WebGL2
  specifically to avoid a 3D-engine dependency; that's superseded because
  compute is now WebGPU, and running WebGPU compute alongside a separate
  WebGL2 render context would force a worse round trip (CPU-mediated
  readback/re-upload between two unrelated GPU stacks) than staying in
  one API. A compute pass's output buffer feeds a render pass directly —
  no per-frame JS-side rebuild/upload of node data. Within that one
  context, be deliberate about what actually needs to leave GPU memory:
  bulk node/candidate/tree data stays resident; only small aggregates
  (the stats-strip numbers) are worth reading back to CPU/DOM.
  Consequence: `/lab` now hard-requires a WebGPU-capable browser (recent
  Chrome/Edge, Firefox, Safari), no WebGL2 fallback — scoped to `/lab`
  only, the main app is untouched. Guard with `!navigator.gpu` and a
  clear message rather than failing silently.

- **Warmup decomposes into independent per-phase searches, not one joint
  enumeration.** Warmup already emits multiple `SwimSet`s today (see
  `protocol_warmup.ts`: loosening/activation/priming; also `warmup.ts`'s
  mixed/pyramid variants) — it's inherently multi-part. If each phase's
  domain were enumerated *jointly* across all phases in one search (the
  natural first instinct for "one slot, one search"), the space
  multiplies: a few hundred combinations per phase, cubed across three
  phases, is already in the hundreds of millions — well past where brute
  force stays practical. Phases don't need to unify with each other
  (nothing in the domain rules requires phase 1's stroke to relate to
  phase 2's), so each phase is searched independently and the results are
  concatenated, keeping every individual search in the same "thousands"
  range as cooldown. The phase *structure* itself (three phases, their
  approximate budget split) stays close to today's fixed proportions for
  this pass; only each phase's reps/distance/stroke/modality/structure
  become real search axes.

## Scope of this pass

1. A correct, tested continuation-based microKanren core (`src/lib/logic/`).
2. Real TS relations + sequential search for the **small view**, covering
   both cooldown and warmup (decomposed into its phases per above),
   producing `SwimSet[]` solutions comparable to today's
   `protocolCooldownGenerator`/`protocolWarmupGenerator` output.
3. Real WGSL relations + brute-force GPU search for the **large view**,
   same two slots, with live re-filtering against a parameter uniform
   buffer.
4. A `/lab` route with both views: a small live-stepping WebGPU tree/
   choice-point renderer for the small view, and a large live-updating
   candidate-population renderer for the large view, both sharing one
   `GPUDevice`/context, plus stats and playback/tuning controls
   appropriate to each.

Explicitly **not** in this pass: `mainSet`, whole-workout joint search,
CPU worker parallelism, node-inspection interaction (pan/zoom is in scope
for the large view per the scope-growth decision; the small view's tree
is small enough to stay legible without it), and wiring either engine
into the main generator flow.

## Track A — Relational search core, domain modeling, and dual search engines

**`src/lib/logic/`** (plain TypeScript where possible, no Svelte —
framework-free, independently testable, matches `src/lib/engine`'s
convention).

- `microkanren.ts` — the continuation-based core: logic variables, a
  substitution (association list, unchanged from the first version — it
  was already plain serializable data), `walk`/`unify`, `callFresh`/
  `freshN`, `conj`/`disj`/`conde`, and `run`/`runStream` entry points.
  Unlike the first version, goals are represented as data an explicit
  trampoline can resume (not `(State) => Stream` closures), so expansion
  proceeds by repeatedly pulling a task off a queue rather than by the JS
  call stack recursing through nested generator calls. Validate against
  `appendo`/`membero` as before, and write the laziness regression test
  (an infinitely-recursive relation, pulled through `run(n, ...)`, must
  terminate without stack overflow) — expect it to reveal whether an
  equivalent of `Zzz` is still needed in this model or not; don't assume
  either way going in.

- `relations.ts` — domain relations for the small view, covering both
  slots. Reuse existing engine types/helpers rather than re-deriving them
  (`GeneratorContext`, `GeneratorConstraints`, `SwimSet` from
  `src/lib/engine/types.ts`, `isModalityAvailable` from `modality.ts`,
  `getAvailableStrokes` from `utils.ts`). As in the first version, logic
  variables represent bounded combinatorial choices (rep count, a small
  set of standard distances, stroke, modality, structure) rather than raw
  arithmetic; budget/duration sums are checked as ordinary JS predicate
  goals over already-unified small-domain values, not unified themselves.
  - Cooldown: one `SwimSet` choice — reps, distance, stroke, modality,
    structure — replacing today's fully-deterministic
    `protocolCooldownGenerator` output with a real (if small) search.
  - Warmup: three independent per-phase searches (loosening, activation,
    priming), each producing its own `SwimSet`, concatenated — not a
    joint search across phases. Each phase's domain is scoped the same
    way cooldown's is (bounded reps/distance/stroke/modality/structure),
    with `isModalityAvailable`/gear checks applied per phase as today's
    generator already does (e.g. activation's `Drill` modality, priming's
    focus-dependent `Build` vs. `MaxEffort` intensity).

- `slot_search.ts` — `searchCooldownSlot(context, constraints)` and
  `searchWarmupSlot(context, constraints)`: run the relations through
  `microkanren.ts`, translating today's soft `focusAlignment` preference
  ordering into `conde` branch order, returning solutions shaped
  identically to today's generators' output for direct comparison.

- `gpu/` — the large view's engine. Not framework-free in the same sense
  as the rest of `src/lib/logic/` (it's inherently browser/WebGPU-only),
  but kept alongside the relations it implements rather than under
  `src/lib/components/`, since it's search logic, not presentation.
  - `webgpu_context.ts` — creates and owns the single shared `GPUDevice`
    (and canvas `GPUCanvasContext`), consumed by both the large view's
    compute pass and both views' render passes (per the one-context
    decision above). Exposes an `!navigator.gpu` check with a typed
    result Track B can render a fallback message from.
  - `candidates.wgsl` (cooldown) and `warmup_candidates.wgsl` (three
    phase-scoped entry points, or three small shaders — TBD at
    implementation time by whichever keeps bind-group setup simplest) —
    WGSL compute shaders: one thread per candidate, generating and
    checking a full candidate assignment against the domain rules in one
    pass, writing pass/fail + score to an output buffer. Enumeration is
    parameter-independent and generated once per slot; a small uniform
    buffer holds the current input parameters and gets rewritten (not the
    candidate buffer) on every parameter change, followed by a redispatch
    of just the filter/score pass.
  - `gpu_search.ts` — TS-side orchestration: pipeline/bind-group setup,
    candidate buffer generation, the uniform-buffer-write-then-redispatch
    loop wired to the trimmed parameter form's reactive state, and
    readback of the small aggregate stats (candidate count, pass count)
    for the stats strip.
  - **Testing note:** this module isn't unit-testable through the
    project's existing Vitest setup — there's no WebGPU implementation in
    the `node`/`happy-dom` test environments it uses. Mitigate, don't
    skip: write a plain, pure TypeScript reference implementation of each
    WGSL shader's predicate logic (candidate validity given a fixed set
    of parameters), spec-tested normally, that the WGSL is manually
    written to match and manually diffed against on review. This doesn't
    exercise the actual GPU execution, but it pins the intended semantics
    down in a versioned, testable way and gives a concrete artifact to
    check the shader against, which is the practical ceiling here absent
    a headless WebGPU test harness (not worth adding for this pass).

## Track B — Live visualization, two views

**Route: `src/routes/lab/+page.svelte`**, added as a fourth tab in
`src/lib/components/Navigation.svelte` ("Lab"), free to have its own
visual language rather than match the swim-app's brutalist form styling —
a console/instrument, not a workout screen. Guards on `!navigator.gpu`
with a clear "requires a WebGPU-capable browser" message before rendering
either view.

- `src/lib/stores/lab_search.ts` — small view's live state: nodes/edges
  derived from the continuation core's task-queue events, running stats
  (attempts, backtracks, depth, solutions found), playback controls
  (pause/resume/speed). Pumped via `requestAnimationFrame`, batching N
  tasks per frame, as in the first version — this part of the original
  design didn't need to change.

- `src/lib/stores/lab_population.ts` — **new.** Large view's live state:
  current parameter values (bound reactively to the trimmed form), the
  live pass/fail/score result of the last filter dispatch, and aggregate
  stats (candidate count, pass count). No playback controls in the small
  view's sense — the "control" is the parameter form itself; changing it
  is what drives the view.

- `src/lib/components/lab/SearchTreeCanvas.svelte` — small view renderer.
  Same design as the first version's WebGL2 renderer (instanced points
  for nodes, lines for edges, cheap CPU-side tidy-tree layout recomputed
  incrementally, color/opacity encoding state), ported to WebGPU instead,
  using the shared `webgpu_context.ts` device.

- `src/lib/components/lab/CandidatePopulationCanvas.svelte` — **new.**
  Large view renderer: reads the compute pass's output buffer directly
  (no CPU round-trip for the bulk data) to draw the candidate population
  — instanced points, one per candidate, color/opacity encoding pass/
  fail/score, recomputed every redispatch. Minimal pan/zoom, since a
  population in the thousands needs it to stay navigable (reversing the
  first version's "no interaction in v1" call for this view specifically;
  the small view's tree is legible without it).

- Controls: a trimmed parameter form (pool size, focus, stroke prefs,
  gear — the subset both `searchCooldownSlot`/`searchWarmupSlot` and the
  large view's uniform buffer actually consume) drives the large view
  reactively on every change (no submit step). The small view keeps a
  more traditional "run a search" control plus play/pause/speed, since
  it's about watching one specific search unfold rather than live-tuning.

## Verification

- `npm run test:unit` — new specs for `microkanren.ts` (`appendo`/
  `membero`/laziness), `relations.ts`, and `slot_search.ts` (both slots),
  plus the pure-TS reference-implementation specs for the WGSL predicate
  logic described above. All should exercise success, backtracking/no-
  solution, and (for the small view) genuine reversibility where
  applicable, as before.
- `npm run check` / `npm run lint` clean on all new files.
- Manual: `npm run dev`, navigate to `/lab` in a WebGPU-capable browser.
  Small view: submit a search, confirm the canvas animates a growing/
  backtracking tree, stats update live, solutions match
  `protocolCooldownGenerator`/`protocolWarmupGenerator` output for the
  same inputs. Large view: confirm the candidate population renders,
  changing a parameter (e.g. dragging pool size or toggling gear)
  visibly updates pass/fail/score across the population within roughly a
  frame, and the WGSL-produced valid candidates spot-check against the
  pure-TS reference implementation's output for the same inputs.
- Manual, non-WebGPU browser: confirm `/lab` shows the fallback message
  rather than failing silently.
