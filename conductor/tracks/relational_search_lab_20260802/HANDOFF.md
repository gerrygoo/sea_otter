# Handoff: Relational Search Engine + Live Visualization

**Branch:** `claude/relational-search-lab` (pushed to origin, branched from
latest `main`). No PR opened yet — this is early/experimental work.
**Status:** `plan.md` is current (second revision). Track A's TypeScript
side is now fully implemented and green: `microkanren.ts` (continuation/
task-based core), `relations.ts` (cooldown + warmup-per-phase candidate
generation and relations), and `slot_search.ts`
(`searchCooldownSlot`/`searchWarmupSlot`). 47/47 tests passing across the
three spec files, `svelte-check`/`lint`/`prettier` clean, no regressions in
the existing 134 engine/e2e-adjacent tests. Next: Track A's `gpu/` module
(WGSL relations + brute-force search for the large view), then Track B's
`/lab` UI.

## Confirmed: the core's stack-safety hypothesis, and what `delay` actually guards

`plan.md` speculated the continuation/trampoline design "likely makes `Zzz`
obsolete" and said to confirm by construction rather than assume. Confirmed,
with a more precise finding than a flat yes/no:

- **Search-time stack safety is unconditional.** The trampoline
  (`step`/`run`/`runStream` in `microkanren.ts`) processes one `Job` per
  loop iteration and pushes follow-up jobs onto an explicit array instead of
  recursing — so search depth, however large, costs queue iterations, never
  JS call-stack frames. This holds for *every* goal, with or without any
  deferral combinator.
- **A deferral combinator (`delay`, this design's much-simplified
  replacement for `Zzz` — a one-line data tag, no generators/`yield*`) is
  still structurally required, but only for relations that reference
  themselves as a bare combinator argument with no intervening
  `callFresh`/`freshN` lambda** (see `foreverO` in the spec). That's a plain
  JS eager-argument-evaluation hazard at goal-*construction* time, and it's
  independent of how a `Goal` is represented internally — no trampoline
  design change avoids it. `appendo`/`membero`'s recursive self-calls, by
  contrast, are already nested inside a `callFresh` lambda, which the
  trampoline never invokes at construction time — so they need no
  wrapping at all (unlike the first design, which wrapped both in `Zzz`
  defensively). See the doc comment on `delay` in `microkanren.ts` and the
  comments above `appendo`/`foreverO` in the spec for the full reasoning.

## WebGPU test environment: resolved, with a caveat

`plan.md`'s Track A "Testing note" assumed no headless WebGPU test harness
exists for this repo's Vitest setup and planned to mitigate via a pure-TS
reference implementation only. Checked this directly before starting
implementation:

- **`npm run test:unit`'s browser project (Playwright-driven headless
  Chromium) has no WebGPU at all** — confirmed via a probe script:
  `navigator.gpu` is `undefined` even in the full (non-headless-shell)
  Chromium binary with `--enable-unsafe-webgpu --ignore-gpu-blocklist`
  flags, headed or headless. So the plan's assumption holds for anything
  driven through `vitest`/Playwright specifically — don't expect to
  automate WebGPU verification through `npm run test:unit`.
- **The `claude-in-chrome` browser tool (the user's real, extension-driven
  Chrome) does get a working WebGPU adapter/device** — confirmed on this
  machine: `navigator.gpu.requestAdapter()` resolves to an AMD GCN-4
  adapter (`maxComputeWorkgroupsPerDimension: 65535`), i.e. this MacBook's
  discrete GPU via switchable graphics, not the Intel HD 630 integrated
  chip `system_profiler` reports by default. So there **is** a route to
  interactively drive and verify the large view's actual WebGPU
  compute/render output once it exists — just manual (via that tool),
  not part of the automated `npm run test:unit` run. Worth using once
  Track A's `gpu/` module and Track B's canvases exist, in addition to
  (not instead of) the pure-TS reference-implementation spec tests the
  plan already calls for.

## Handoff paragraph (for a new session with no prior context)

This repo (`gerrygoo/sea_otter`, "G's Swimming Generator") has a working,
tested lap-swimming workout generator (`src/lib/engine`) built as a
heuristic "bucket and filler" pipeline — see `docs/ARCHITECTURE.md` for
how it works and `docs/ENGINE_REVIEW.md` for a critical assessment (main
gap: it patches its own output after the fact instead of being correct by
construction). The intent, revived now that generation latency is not a
constraint, is to express workout generation *relationally* (miniKanren-
style: logic variables + constraints, solved via search) instead of
procedurally, on a separate experimental `/lab` route, without touching
the existing generator flow or UI. `plan.md` in this directory is the
current, complete design: a continuation/task-based hand-rolled
microKanren core, two slots (cooldown, warmup — each per-phase for
warmup, not jointly), and **two `/lab` views** — a small single-threaded
sequential-backtracking view (the original "watch it think" pitch) and a
large WebGPU-primary brute-force-enumeration view with live parameter-
reactive re-filtering over a candidate population in the thousands. Read
`plan.md` in full, including its "Decisions locked in" section for the
reasoning behind each choice, before writing any code.

`src/lib/logic/microkanren.ts` implements that core and is green (see
"Confirmed" section above for what the laziness regression test actually
established about `delay` vs. the old `Zzz`). `relations.ts` and
`slot_search.ts` now implement the rest of Track A's TypeScript side —
see "Track A TypeScript side: complete" below for the shape and a design
decision worth knowing about (why `searchCooldownSlot` returns one
solution, not the full candidate set). **The next concrete step is Track
A's `gpu/` module**: `webgpu_context.ts`, the WGSL compute shaders
(`candidates.wgsl`, `warmup_candidates.wgsl`), and `gpu_search.ts`'s
orchestration, per `plan.md`'s Track A section — then Track B's `/lab`
UI. See the "WebGPU test environment" note above for how to verify the
GPU side once it exists (headless Vitest can't; the claude-in-chrome
tool's real browser can).

## Track A TypeScript side: complete

`relations.ts` builds each slot/phase's candidate population as an
ordinary JS Cartesian product (reps × distance × stroke × modality),
filtered by budget/gear/`isModalityAvailable` checks in plain JS — not
unified relationally — per the plan's explicit CLP(FD)-avoidance scoping.
Candidates are pre-sorted so the first is the most preferred (stroke
preference descending, then distance/reps descending), then fed to
`microkanren.ts`'s `conde` as one clause per candidate: the relational
core's job is genuinely the search/enumeration itself (in a specific,
meaningful order), not the filtering.

`slot_search.ts`'s `searchCooldownSlot`/`searchWarmupSlot` return only
the single most-preferred solution per slot/phase — deliberately the
same shape as `protocolCooldownGenerator`/`protocolWarmupGenerator`'s
output (one `SwimSet` per cooldown call, three for warmup), for direct,
apples-to-apples comparison. This means the day-to-day search feels
"deterministic" today, same as the heuristic engine it's replacing — the
payoff of having a real search (multiple valid candidates, explorable in
a specific preference order) is available but not exercised by
`slot_search.ts` itself; it's exercised directly in `relations.spec.ts`
via `run(candidates.length, ...)`, and is what Track B's future
search-visualization work should hook into (the full candidate
population + `conde`'s branch order *is* the choice-point tree to
visualize).

One functional improvement over today's generator, found while modeling
activation's domain: `isModalityAvailable(context, Modality.Drill)` is
now actually enforced before offering Drill as a modality candidate.
Today's `protocol_warmup.ts` applies `Modality.Drill` unconditionally,
regardless of gear/stroke-preference — a small instance of the
"correct by construction" gap `docs/ENGINE_REVIEW.md` critiques the
existing heuristic engine for.

Also fixed along the way: `conde` in `microkanren.ts` built its
disj/conj chains with a left fold, which reordered solutions away from
clause order for 3+ clauses under the FIFO trampoline (see the commit
`fix(logic): preserve conde clause order for 3+ clauses` and the comment
above `conde`'s definition) — found because `relations.ts`'s candidate
ordering depends on `conde` trying clauses in the order given, for
arbitrarily many clauses, not just the 2-clause cases the original spec
happened to test.

## Quick facts

- `src/lib/logic/` now has: `microkanren.ts`, `relations.ts`,
  `slot_search.ts`, and their specs. Nothing outside this track's docs
  and `src/lib/logic/` has been created or modified on this branch.
- No dependencies are planned for the small view. The large view needs
  none either — WebGPU is a browser API, not a package.
- This work is intentionally kept off `main` and off the existing
  generator flow — do not wire it into `src/routes/+page.svelte` or touch
  `src/lib/engine/` as part of this track.
- `plan.md`'s "Decisions locked in" section is the authoritative record of
  *why* each choice was made (two views, brute force over wave expansion,
  WebGPU over WebGL2/SharedArrayBuffer, per-phase warmup decomposition,
  etc.) — refer back to it rather than re-deriving reasoning from scratch
  if a design question comes up during implementation.
