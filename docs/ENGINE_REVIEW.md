# Engine Review — Software Engineering & CS Perspective

A critical assessment of `src/lib/engine`, written while resuming
development on the project. For what the engine does and how the pieces
fit together, see `docs/ARCHITECTURE.md`; this doc is the opinionated
follow-up — what's well designed, and what's worth fixing before the
engine grows further.

## What's good, architecturally

**The Structure × Modality × Stroke decomposition is the best decision in
the codebase.** Instead of one generator per combination ("PyramidPull
BreaststrokeGenerator"), the axes are orthogonal and composed at
generation time (`index.ts:81-95` picks modality from focus, generators
emit structure, `applyModality` layers modality metadata on top). That's
the difference between a combinatorial explosion of classes and a small
set of composable primitives — real domain modeling, not just code
organization.

**The generator contract is Strategy + Chain of Responsibility, and it's
used correctly.** `SetGenerator.generate()` returning `null` as "I
decline" (wrong gear, disabled stroke, budget too small) lets `fillSlot`
just walk the sorted list until something succeeds — no central
if/gear/if/preference rule engine anywhere. `focusAlignment` turns
generator selection into a soft ranking rather than hardcoded dispatch,
which is what lets `randomize` produce variety (shuffle top 3) without
producing garbage. This is a clean way to get "usually best, sometimes
different" behavior out of a deterministic-ish system.

**The engine is a genuinely pure functional core.** No Svelte imports, no
I/O, `GeneratorContext`/`GeneratorConstraints` in, `SwimSet[] | null` out.
That buys real testability — every generator has a co-located spec — and
means the whole thing is portable if the UI layer ever changes. Good
functional-core/imperative-shell discipline.

**Zod schemas mirroring the TS types at the `localStorage` boundary**
(`schema.ts`) are in the correct place to spend validation effort —
untyped JSON coming back from persistence — rather than validating
everywhere.

## Where I'd push back

**Stringly-typed leakage undermines the type system it built.**
`SwimSet.stroke: StrokeStyle | string` and `intensity?: EffortIntensity |
string` (`types.ts:86,88`) are escape hatches that are actually exercised
— `specialty.ts:37` sets `stroke: 'Dolphin Kick Underwater'`, a raw string
with no relationship to `StrokeStyle` at all. Once one generator does
this, downstream code (`mutateStroke`, tagging, UI) can no longer trust
the type and has to handle "enum or arbitrary string" everywhere.

**`tagWorkout` re-derives structured information by regexing prose it just
generated** (`tagging.ts:8-18` — `desc.includes('pyramid')`,
`desc.includes('hypoxic')`, etc.). Every set already carries `structure`
and `modality` as enums. Tagging off the free-text description instead of
those fields means the description format and the tag logic are now two
representations of the same fact that can silently drift — change a
description string and a tag disappears with no compile-time or
type-level signal.

**Magic-number pace defaults are duplicated and inconsistent, not
centralized.** The "default pace when CSS is absent" shows up as `90` in
`basic.ts:21`, `100` in `index.ts:269` (`fillSlot`'s fallback), `115` in
`build.ts:19`, `110` in `protocol_cooldown.ts:20/45`. These aren't the
same number for a reason discoverable in the domain — they read like
organically-added constants rather than a deliberate table. That's a DRY
violation with actual behavioral consequences (different generators
assume different "no-CSS" swimmer speeds).

**The orchestrator corrects its own imprecision after the fact rather than
being correct by construction.** The bucket-and-filler is a greedy
proportional split with hard caps, and then `generateWorkout` runs a
"distance top-off" and a "mandatory segment fallback" pass afterward
(`index.ts:135-200`) to patch what the greedy fill didn't nail. That's a
reasonable tradeoff for a human-facing generator — this doesn't need a
constraint solver — but architecturally it means correctness lives partly
in the fill heuristic and partly in bolted-on repair steps, which is a
smell if the blueprint ever grows more slots.

**`generateSimilar` has a silent no-op path.** `mutateStroke`/
`mutateStructure` (`mutation.ts:34-95`) can each fail their precondition
and just `return workout` unchanged — e.g. no alternate stroke available,
or a rep count that's neither 1, 2, nor even. Since the caller picks a
random strategy and applies it 1-2 times with no success check, "find
similar" can, in an unlucky draw, hand back a workout identical to the one
you started from with no signal that it happened. For a feature explicitly
pitched as "explore adjacent workouts," that's a real correctness gap
worth a regression test.

**Minor CS-hygiene notes**: `JSON.parse(JSON.stringify(workout))` for deep
clone (`mutation.ts:11`) works here since the data is flat/serializable,
but `structuredClone()` is the modern correct primitive and doesn't
silently mangle edge cases. And the description-rewriting regexes in
`mutateStructure` (`new RegExp(`${set.reps * 2}\s*x\s*\d+`)`) assume every
generator's description matches an exact `"N x D"` phrasing — another spot
where free text and structured mutation are coupled in a way that'll break
quietly if a generator's phrasing changes.

## Bottom line

The shape of the system — pure core, strategy-pattern generators,
orthogonal domain axes, null-as-decline — is genuinely good design that
will scale fine as more generators are added. The debt is concentrated in
one recurring pattern: treating the human-readable `description` string as
if it were structured data (tagging, mutation) instead of deriving
everything from the enums the sets already carry. Fixing that one pattern
resolves most of the fragility noted above.
