# Handoff: Relational Search Engine + Live Visualization

**Branch:** `claude/relational-search-lab` (pushed to origin, branched from
latest `main`). No PR opened yet — this is early/experimental work.
**Status:** Planning complete, implementation not yet started. Zero code
changes exist on this branch so far; only this track's docs.

## Handoff paragraph (for a new session with no prior context)

This repo (`gerrygoo/sea_otter`, "G's Swimming Generator") has a working,
tested lap-swimming workout generator (`src/lib/engine`) built as a
heuristic "bucket and filler" pipeline — see `docs/ARCHITECTURE.md` for
how it works and `docs/ENGINE_REVIEW.md` for a critical assessment of its
design (the main gap: it patches its own output after the fact instead of
being correct by construction). When the project was originally conceived
the intent was actually to model workout generation *relationally* —
miniKanren-style, with logic variables and constraints solved via search —
and that idea got revived once it was confirmed that generation latency no
longer matters here, as long as the search is visibly happening to the
user. This branch starts exactly that: (A) a hand-rolled microKanren core
in TypeScript plus real relations that replace one workout slot's
generation (cooldown, chosen as the smallest/simplest) with actual
constraint search instead of a heuristic generator, and (B) a new `/lab`
route that renders that search live in WebGL2 as it runs — a tree of
choice points growing/backtracking in real time, with stats and playback
controls. The full architecture, the key design decisions already agreed
with the user (per-slot search not whole-workout, hand-rolled core not a
library, no 3D dependency for the renderer), and a file-by-file breakdown
of both tracks are in `plan.md` next to this file — read that in full
before writing code. **The very next concrete step is to write
`src/lib/logic/microkanren.spec.ts`** (TDD red phase, per this repo's
`conductor/workflow.md`), covering `appendo`/`membero` correctness plus a
laziness regression test — `plan.md`'s Track A section derives exactly why
a naive hand-rolled microKanren stack-overflows on recursive relations
unless recursive self-calls are wrapped in a `Zzz`/delay combinator, and
gives the `mplus`/`bind`/`Zzz` design to implement. Once that spec is
red, implement `src/lib/logic/microkanren.ts` to turn it green, then move
to `relations.ts`/`slot_search.ts` for the cooldown slot (Track A), before
starting Track B's `/lab` UI.

## Quick facts

- Nothing outside this track's three docs (`metadata.json`, `plan.md`,
  this file) has been created or modified on this branch.
- No dependencies were added or are planned to be added for Track A. For
  Track B, plan on zero new dependencies too (hand-rolled WebGL2, no
  three.js) unless that's revisited.
- An in-session task list (microKanren core → slot relations → `/lab` UI →
  verification) existed in the session that wrote this handoff, but task
  state doesn't persist across sessions — recreate from `plan.md`'s
  "Scope of this pass" if useful.
- This work is intentionally kept off `main` and off the existing
  generator flow — do not wire it into `src/routes/+page.svelte` or touch
  `src/lib/engine/` as part of this track.
