# Handoff: Relational Search Engine + Live Visualization

**Branch:** `claude/relational-search-lab` (pushed to origin, branched from
latest `main`). No PR opened yet — this is early/experimental work.
**Status:** `plan.md` is current (second revision). `src/lib/logic/microkanren.ts`
now implements Track A's continuation/task-based core and is green against
a rewritten `microkanren.spec.ts` (15/15 passing, `svelte-check`/`lint`
clean, no regressions in the existing 118 engine tests). Next: `relations.ts`
and `slot_search.ts` for both slots (cooldown, warmup), per `plan.md`'s
Track A section.

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

`src/lib/logic/microkanren.ts` now implements that core and is green (see
"Confirmed" section above for what the laziness regression test actually
established about `delay` vs. the old `Zzz`). **The next concrete step is
`relations.ts`**: domain relations for cooldown and warmup (per-phase),
built on `GeneratorContext`/`GeneratorConstraints`/`SwimSet` and
`isModality Available`/`getAvailableStrokes` per `plan.md`'s Track A
section, then `slot_search.ts`'s `searchCooldownSlot`/`searchWarmupSlot`
entry points. After those are green, move to the WGSL side
(`src/lib/logic/gpu/`) before Track B's `/lab` UI — and see the "WebGPU
test environment" note above for how to verify that part once it exists.

## Quick facts

- `src/lib/logic/microkanren.ts` and its spec are the only implementation
  code on this branch so far; nothing outside this track's docs and those
  two files has been created or modified.
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
