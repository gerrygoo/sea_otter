# Handoff: Relational Search Engine + Live Visualization

**Branch:** `claude/relational-search-lab` (pushed to origin, branched from
latest `main`). No PR opened yet — this is early/experimental work.
**Status:** A non-functional-requirements discussion has substantially
revised the design `plan.md` describes. **That revision has not been
written into `plan.md` yet** — this document is the handoff for the
session that does it. Zero implementation code exists for the *revised*
design; the one code change on this branch (`src/lib/logic/microkanren.spec.ts`,
commit `a2700e3`) targets the **old, now-superseded** design and needs
rework, not extension. Read the "What's stale" section below before
touching any existing file on this branch.

## Handoff paragraph (for a new session with no prior context)

This repo (`gerrygoo/sea_otter`, "G's Swimming Generator") has a working,
tested lap-swimming workout generator (`src/lib/engine`) built as a
heuristic "bucket and filler" pipeline — see `docs/ARCHITECTURE.md` for
how it works and `docs/ENGINE_REVIEW.md` for a critical assessment (main
gap: it patches its own output after the fact instead of being correct by
construction). The intent, revived now that generation latency is not a
constraint, is to express workout generation *relationally* (miniKanren-
style: logic variables + constraints, solved via search) instead of
procedurally, on a separate experimental `/lab` route, starting with one
slot (cooldown — smallest, fewest constraints). `plan.md` in this
directory documents a first design for that (hand-rolled microKanren core
using JS generators, WebGL2 renderer, small single-threaded search tree).
**That design has since been substantially revised in an NFR-gathering
conversation** (this session), driven by two requirements the user
introduced explicitly: (1) search-expansion should use real hardware
parallelism, not just cooperative interleaving, and should be able to
"use as much compute power as is reasonable"; (2) the user wants to
change input parameters (pool size, focus, stroke prefs, gear, etc.) and
see a *large number* of generated candidate workouts update rapidly in
response — a live-tuning UX, not a request/response "click to generate."
Working through the consequences of those two requirements changed nearly
every architectural decision in `plan.md`. **The next session's job is to
rewrite `plan.md` end-to-end to reflect the decisions below**, with a
proper file-by-file breakdown for both tracks, before any implementation
resumes.

## Decisions from the NFR discussion (supersede `plan.md` where they conflict)

### Two views, not one, on `/lab`

The single biggest resolution: brute-force/wave-parallel GPU search (see
below) has no backtracking to show — every candidate is evaluated
independently and simultaneously, there's no sequence of choice points
retreating from failure. That's a different visual identity than
`plan.md`'s original pitch ("a tree of choice points growing/backtracking
in real time"). Rather than pick one, `/lab` gets **two views**:

1. **Small view — the original pitch, mostly unchanged.** A genuinely
   small, single-threaded, sequential backtracking search with real choice
   points and real retreat-on-failure, stepped via `requestAnimationFrame`
   for the "watch it think" narrative. Doesn't need GPU compute or CPU
   worker parallelism — it's intentionally small, so single-threaded is
   the right tool. Still needs the continuation-based core (see below),
   not the original generator-based one, but the *search strategy itself*
   (DFS with backtracking) is unchanged from `plan.md`.
2. **Large view — new, driven by both NFRs above.** GPU-primary bulk
   evaluation of a large candidate space (brute-force enumeration of the
   full bounded domain, or bulk-synchronous wave expansion — see below),
   with live re-filter/re-score against a small uniform-buffer of current
   input-parameter values, so dragging a slider updates potentially tens
   of thousands of candidates' pass/fail/score in roughly a frame.

Both views validate candidates against the **same domain rules**
(time/distance budget, focus alignment, gear availability, stroke
preferences) but that logic has to be **implemented twice** — once as
TypeScript goals for the small view's core, once as WGSL for the large
view's compute shaders. WGSL cannot share code with TypeScript. This is
an accepted, ongoing cost, not a blocker — keep one canonical spec (prose
+ tests) both implementations are independently held to; do not attempt
to generate one from the other.

### Track A core: continuation-based, not closure/generator-based

`plan.md` specifies `Goal = (State) => Stream` implemented with JS
generators (`mplus`/`bind` as `function*` bodies), with a `Zzz` delay
combinator to avoid stack overflow on recursive relations (goal
*invocation* is eager even though generator bodies are lazy). **This is
superseded.** The core is now continuation/task-based: goals and search
state are flat, serializable data (a state is already just a substitution
+ var counter, which was already serializable — no change there; the
*goal representation* changes from opaque closures to data a trampoline
can resume). An explicit trampoline (not the JS call stack) drives
expansion, one step at a time, off a task queue.

Consequence worth knowing going in: this likely makes `Zzz` **obsolete**.
The stack-overflow trap `plan.md` describes is specific to goal invocation
being a real JS function call recursing through the JS call stack. Once
goals are data and expansion is driven by an explicit trampoline pulling
tasks off a queue, a recursive relation doesn't recurse through the JS
call stack at all — it just re-enqueues itself as a task. The classic
delay-combinator workaround may not be needed in the same form. Confirm
this by construction (write the laziness regression test first, as before
— it just may pass without needing an equivalent of `Zzz`) rather than
assuming.

This core is shared by both views: the small view drives it directly
(sequential, single-threaded), the large view's WGSL implementation is a
*separate* implementation of the same domain rules (see "two views"
above), not a reuse of this TypeScript core.

### Compute engine: WebGPU-primary; CPU parallelism deferred

Real hardware parallelism was the first NFR raised. The path explored
first was `SharedArrayBuffer` + `Atomics` (shared-memory work-stealing
across Web Workers) — this was tentatively chosen, **then superseded**
once WebGPU came up: GPU compute (thousands of SIMT threads) is a much
bigger parallelism lever than a CPU worker pool for this specific
workload shape (bounded, small-domain combinatorial candidates —
rep count, standard distances, stroke, modality, structure — which is
exactly what GPU compute is good at: flat, branch-light, data-parallel
work). **CPU/SharedArrayBuffer workers are explicitly deferred/dropped
for this pass**, not part of the design to implement now.

Why GPU compute needs a different algorithm shape, not just a faster
version of the same one: GPU compute shaders (WGSL) are SIMT — thread
divergence inside a workgroup serializes branchy control flow, so literal
one-node-at-a-time DFS-with-backtracking does not map well to the
hardware. WGSL also has no recursion, no dynamic allocation, and WebGPU
has no dynamic kernel launch (a dispatch's thread count is fixed before
it starts). The fit instead is:
- **Bulk-synchronous wave expansion:** generate all candidate children for
  the entire current frontier in one dispatch (one thread per candidate),
  evaluate constraints as flat per-candidate checks, stream-compact
  survivors into the next frontier, repeat per level; or
- **Brute-force enumeration:** since the domains are already small/bounded
  by `plan.md`'s original design (logic variables represent bounded
  combinatorial choices, not open arithmetic), the entire Cartesian
  product for a slot may be enumerable outright — one GPU thread per full
  candidate, all constraints checked in a single dispatch. This is the
  more likely fit for the large view specifically, because it makes the
  "rapid update on parameter change" requirement close to free: **the
  candidate enumeration doesn't depend on input parameters at all — only
  the pass/fail/score check does.** So the enumeration buffer can be
  generated once and stay resident; a parameter change is just
  `device.queue.writeBuffer` on a small uniform buffer + redispatch of the
  filter/score pass. Which of these two (or whether the large view needs
  both, e.g. wave expansion for a whole-workout joint search later)
  applies is an **open question for the plan-writing session** — brute
  force is likely sufficient for a single slot's bounded domain, revisit
  if the domain grows large enough that full enumeration becomes
  impractical.

### Renderer: WebGPU, not WebGL2 — single unified context

`plan.md` locked in hand-rolled WebGL2 specifically to avoid a 3D-engine
dependency. **Superseded:** since compute is now WebGPU-primary, the
renderer is WebGPU too, in the **same context** as compute — explicitly
not WebGPU-compute-plus-WebGL2-render, which would force a worse round
trip (CPU-mediated readback/re-upload between two unrelated GPU stacks)
than staying in one API. Within that single context, be deliberate about
what actually needs to leave GPU memory: bulk node/candidate/tree data
should stay resident and feed the render pass directly (this is the
actual point of unifying — a compute pass's output buffer can be bound
directly as a render pass's input, zero CPU round-trip); only small
aggregate values that genuinely need CPU/DOM (the stats-strip numbers —
attempt count, backtrack count, solutions found) are worth reading back.

Consequence to design for, not a blocker: `/lab` now hard-requires a
WebGPU-capable browser (recent Chrome/Edge, Firefox, Safari) with **no
WebGL2 fallback**. Add a `!navigator.gpu` guard with a clear message
rather than letting it fail silently. This is scoped to `/lab` only — the
main app is untouched, so this doesn't raise the browser bar for the
product as a whole.

### Hosting: no change needed for this pass

Chased down because `SharedArrayBuffer` was briefly in scope: this repo
deploys via `adapter-static` to **GitHub Pages** (`.github/workflows/deploy.yml`),
which cannot set custom response headers, and `SharedArrayBuffer` requires
cross-origin-isolation headers (`Cross-Origin-Opener-Policy` /
`Cross-Origin-Embedder-Policy`) that GitHub Pages structurally can't send.
A workaround exists (a `coi-serviceworker`-style service worker that
injects those headers client-side, stacking on top of the PWA's existing
service worker, forcing one reload on first visit) and the user approved
using it *if* `SharedArrayBuffer` were needed, with an eventual move to
Cloudflare hosting to drop the workaround later. **Since CPU/SAB workers
are now deferred, none of this is needed for this pass** — WebGPU itself
has no cross-origin-isolation requirement and works on GitHub Pages as-is.
Keep this paragraph as a note for if/when CPU worker parallelism gets
picked back up.

### Scope grown deliberately this pass

The user chose to grow scope now rather than defer: a genuinely large,
parallelizable search space (richer domain and/or more slots — **open
question**, not yet decided which axis), plus minimal pan/zoom pulled
into the renderer so a larger tree/population stays navigable. This
reverses `plan.md`'s original "no pan/zoom/node-inspection interactions
in v1" call for the large view specifically; the small view can likely
stay as originally scoped (no interaction needed for a small illustrative
tree).

### Unchanged from `plan.md`

- Per-slot search (not whole-workout joint search) for this pass.
- Cooldown as the target slot (unless the "open question" above resolves
  toward widening — confirm with the user before assuming that).
- This stays a separate experimental surface (`/lab` route); the existing
  generator flow and UI (`src/lib/engine`, `src/routes/+page.svelte`) are
  untouched.
- Reuse existing engine types/helpers (`GeneratorContext`,
  `GeneratorConstraints`, `SwimSet` from `src/lib/engine/types.ts`,
  `isModalityAvailable`, `getAvailableStrokes`) rather than re-deriving
  them — applies to the small view's TypeScript goals at least; the large
  view's WGSL implementation obviously can't import TS directly, so it'll
  need its own small, explicitly-synced copy of the relevant constraint
  values/logic.

## What's stale

- **`plan.md`** (this directory) — describes the pre-this-conversation
  design (generator-based core, WebGL2 renderer, single small view, no
  GPU compute, no live-parameter-tuning). Read it for historical context
  on *why* per-slot/cooldown/hand-rolled-core were chosen — those
  rationales still hold — but do not implement against its Track A/B
  file-by-file breakdown or its verification section as written.
- **`src/lib/logic/microkanren.spec.ts`** (commit `a2700e3`) — a red-phase
  TDD spec written against the old `Goal = (State) => Stream` closure/
  generator design, including a `Zzz`-specific laziness regression test.
  Once the continuation-based core's shape is settled in the rewritten
  plan, this file needs rework (likely a rewrite, not a port — the `Zzz`
  test in particular may not apply to the new model, per the "may be
  obsolete" note above). Do not extend it as-is.

## Next step

Rewrite `plan.md` end-to-end (new file-by-file breakdown, new
verification section) to reflect every decision above, resolving the two
open questions first (brute-force vs. wave-expansion for the large view;
whether "grow the search space" means richer domain, more slots, or
both) — ask the user if they're not obviously implied by the rest of the
plan. Only after `plan.md` is rewritten and the user has reviewed it
should implementation resume, starting again from a red-phase spec for
the continuation-based core.

## Quick facts

- Nothing outside this track's docs and `src/lib/logic/microkanren.spec.ts`
  has been created or modified on this branch.
- No dependencies were added or are currently planned for the small view.
  The large view will need none either — WebGPU is a browser API, not a
  package.
- This work is intentionally kept off `main` and off the existing
  generator flow — do not wire it into `src/routes/+page.svelte` or touch
  `src/lib/engine/` as part of this track.
