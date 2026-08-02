# Handoff: Relational Search Engine + Live Visualization

**Branch:** `claude/relational-search-lab` (pushed to origin, branched from
latest `main`). No PR opened yet — this is early/experimental work.
**Status:** `plan.md` has been rewritten to its second revision and is
current — no more stale banner, read it as the source of truth. Zero
implementation code exists for this revision yet. One code file predates
it and needs rework, not extension: `src/lib/logic/microkanren.spec.ts`
(commit `a2700e3`) targets the **first, superseded** design (closures/
generators, `Zzz`). See "What's stale" below before touching it.

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

**The very next concrete step is to write a red-phase spec for
`src/lib/logic/microkanren.ts`** — `plan.md`'s Track A section specifies a
continuation/task-based core (goals and search state as flat,
serializable data, an explicit trampoline driving expansion rather than
JS closures/generators), which is a different public shape than the
existing (stale) `microkanren.spec.ts`. Validate against `appendo`/
`membero` as before, and include the laziness regression test (an
infinitely-recursive relation pulled through `run(n, ...)` must terminate
without stack overflow) — `plan.md` flags that this core design may make
the first version's `Zzz` delay-combinator trap and fix unnecessary;
confirm that by writing and running the test, don't assume it going in.
After that's green, move to `relations.ts`/`slot_search.ts` for both
slots (Track A), then the WGSL side (`src/lib/logic/gpu/`) before Track
B's `/lab` UI.

## What's stale

- **`src/lib/logic/microkanren.spec.ts`** (commit `a2700e3`) — red-phase
  TDD spec written against the first version's `Goal = (State) => Stream`
  closure/generator design, including a `Zzz`-specific laziness
  regression test. Needs a rewrite (not a port) once the continuation-
  based core's shape is settled — see `plan.md`'s Track A section and the
  paragraph above. Do not extend it as-is.

## Quick facts

- Nothing outside this track's docs and `src/lib/logic/microkanren.spec.ts`
  has been created or modified on this branch.
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
