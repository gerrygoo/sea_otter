# Workout Engine Architecture

This document explains how `src/lib/engine` turns a `WorkoutParameters` object
into a structured `Workout`. It's the deep dive; for the product concept see
`conductor/product.md`, and for the general project layout see the root
`README.md`.

The engine is plain, framework-free TypeScript — no Svelte imports anywhere
under `src/lib/engine`. It's called directly from `src/routes/+page.svelte`
and could be lifted into any other context unchanged.

## 1. The core flow

```
WorkoutParameters ──▶ generateWorkout() ──▶ Workout { warmup, mainSet, cooldown }
```

Entry points, all in `index.ts`:

- **`generateWorkout(params, randomize?)`** — builds one workout.
- **`generateWorkoutOptions(params, count)`** — calls `generateWorkout` with
  `randomize: true` `count` times, so the UI can present a few distinct
  options for the same parameters.
- **`generateSimilar(workout, params, count)`** — "space traversal": takes an
  existing workout and produces `count` nearby variations via `mutation.ts`
  instead of generating from scratch.

## 2. Types (`types.ts`)

- `WorkoutParameters` — the user's input: pool size/unit, time-or-distance
  target, available `Gear`, `TrainingFocus`, per-stroke `StrokePreferences`
  (1–5 scale), effort level, optional `cssPace`.
- `SwimSet` — one line of a workout (reps, distance, stroke, description,
  intensity, interval/rest seconds, gear used, modality, structure).
- `Workout` — `{ warmup, mainSet, cooldown }` arrays of `SwimSet`, plus
  `totalDistance`, `estimatedDurationMinutes`, `tags`.
- `GeneratorContext` / `GeneratorConstraints` / `SetGeneratorFunction` /
  `SetGenerator` — the generator plugin contract (see §4).

`schema.ts` mirrors these with Zod schemas (`WorkoutSchema`,
`WorkoutParametersSchema`, `SavedWorkoutSchema`, ...) used for validating
data coming out of `localStorage` (see `src/lib/utils/storage.ts`).

## 3. Blueprint & "Bucket and Filler" orchestration

`index.ts` defines a `StandardBlueprint`: three slots, each with a time/
distance budget percentage and an ordered list of candidate generators.

| Slot        | Budget | Candidate generators (in list order)                                                                                       |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `warmup`    | 20%    | `protocolWarmupGenerator`, `mixedWarmupGenerator`, `pyramidWarmupGenerator`, `basicIntervalGenerator`                         |
| `mainSet`   | 70%    | `pyramidGenerator`, `ladderGenerator`, `basicIntervalGenerator`, `descendingGenerator`, `buildGenerator`, `testSetGenerator`, `hypoxicGenerator`, `underwaterGenerator`, `drillGenerator` |
| `cooldown`  | 10%    | `protocolCooldownGenerator`, `basicIntervalGenerator`                                                                         |

`generateWorkout` fills these slots in a specific order and with specific
rules:

1. **Main set first.** It's treated as the anchor of the workout. Its
   modality is chosen from the training focus before any generator runs:
   `Strength` prefers `Pull` (falling back to `Kick`), `Technique` prefers
   `Drill` (falling back to `Kick`), everything else swims.
2. **Remaining slots (warmup, cooldown) split whatever budget is left**,
   proportionally to their blueprint weights, with a hard cap of 30% of
   total time per slot so a long remainder can't produce an absurd warmup.
3. **Distance top-off.** After all three slots are filled, if the workout is
   distance-targeted and short of the target, or the total isn't a multiple
   of a pool round-trip (`poolSize * 2`), an extra easy cooldown set is
   appended to land exactly on target/on the wall.
4. **Mandatory segment fallback.** For workouts ≥ 40 minutes, if the warmup
   or cooldown ended up empty, a fixed fallback set (300 Free Easy / 200 Free
   Easy) is inserted so those workouts are never structurally incomplete.
5. **`assembleWorkout`** concatenates the three arrays, sums distance and
   duration, and calls `tagWorkout` (see §7) to attach summary tags.

### Filling a single slot: `fillSlot`

For each slot, `fillSlot`:

1. Sorts the slot's generators by `focusAlignment[context.focus]`
   (0.0–1.0+, missing = 0) — the best-matching generator for the current
   `TrainingFocus` goes first.
2. If `randomize` is set (used by `generateWorkoutOptions`), Fisher-Yates
   shuffles the **top 3** generators only, so variety comes from rotating
   between roughly-equally-good strategies rather than degrading quality.
3. Calls `generator.generate(context, constraints)` down the sorted list and
   **takes the first non-null result.** A generator returns `null` when its
   preconditions aren't met (wrong gear, stroke disabled, budget too small,
   etc.) — see §4.
4. Once a generator produces sets, `fillSlot` fills in the cross-cutting
   fields every set needs regardless of which generator built it: `intensity`
   (from `getFocusIntensity`, or always `Easy` for warmup/cooldown),
   `targetPacePer100` and `restSeconds` (from `pace_logic.ts`), and a final
   `intervalSeconds` rounded up to the nearest 5 seconds.

This is why individual generators don't need to know about pacing — they
describe the *shape* of a set (reps/distance/stroke/structure) and the
orchestrator layers pace/rest/intensity on top uniformly.

## 4. The generator contract

```ts
type SetGeneratorFunction = (
  context: GeneratorContext,
  constraints: GeneratorConstraints
) => SwimSet[] | null;

interface SetGenerator {
  generate: SetGeneratorFunction;
  name: string;
  focusAlignment: Partial<Record<TrainingFocus, number>>;
}
```

- `context` carries pool config, gear, focus, stroke preferences, CSS.
- `constraints` carries the slot's `timeBudgetSeconds` and/or
  `distanceBudget`, and optionally a forced `modality`.
- A generator returns `null` to say "I can't/won't produce a set here" —
  e.g. gear missing, the relevant stroke preference is `1` (disabled), or
  the budget is too small to fit even one rep. `fillSlot` treats `null` as
  "try the next generator," which is how gear/preference gating and graceful
  degradation both work without any central rule engine.
- Generators are pure functions of `context`/`constraints`; randomness
  (variant selection, drill choice) is `Math.random()`-based and local to
  each generator.

Adding a new set type means writing one `SetGenerator` and adding it to the
appropriate list in `index.ts` — no orchestration changes required.

## 5. Generator catalog (`generators/`)

| File | Generator(s) | Produces |
| --- | --- | --- |
| `basic.ts` | `basicIntervalGenerator` | Straight `N x 100` at a default pace; the universal fallback (appears in all three blueprint slots). |
| `patterns.ts` | `pyramidGenerator`, `ladderGenerator` | Picks the largest distance variation (e.g. `200-300-400-500-400-300-200`) that fits the budget, optionally repeated up to 2 rounds. |
| `descending.ts` | `descendingGenerator` | `4 x 100`, each rep 5s/100 faster than the last, based off CSS-derived pace. |
| `build.ts` | `buildGenerator` | `6 x 50` "build" (accelerate within the rep). |
| `test_sets.ts` | `testSetGenerator` | A single max-effort 400 with 5 min full recovery, flagged `isTest: true` — used to refresh CSS. |
| `hypoxic.ts` | `hypoxicGenerator` | A fixed breath-control ladder (250 breathe-3 → 50 breathe-7). Skipped if Freestyle is disabled. |
| `specialty.ts` | `underwaterGenerator` | `N x 25` no-breath dolphin-kick underwater work, capped at 8 reps. |
| `drills.ts` | `drillGenerator` | Picks a stroke, then a matching drill from `DRILL_LIBRARY` whose gear requirements are satisfied; skipped if Drill preference is `1`. |
| `protocol_warmup.ts` | `protocolWarmupGenerator` | The structured 3-phase warmup from the product spec: Loosening (45%, easy swim) → Activation (35%, kick/drill) → Priming (20%, build or variable-speed depending on focus). Requires ≥300s / ≥200 distance. |
| `protocol_cooldown.ts` | `protocolCooldownGenerator` | A single easy cooldown swim, with volume scaled up (10%→15%) when the focus implies high main-set intensity. |
| `warmup.ts` | `mixedWarmupGenerator`, `pyramidWarmupGenerator` | Alternative warmup shapes used as fallbacks below the protocol warmup in the blueprint's generator list. |
| `gear.ts` | `pullGenerator`, `kickGenerator` | Standalone pull/kick set generators. **Not currently wired into `StandardBlueprint`** — modality-specific main sets are instead produced by running `basicIntervalGenerator`/`drillGenerator` with a forced `modality` (see §3) and tagging the result via `applyModality`. Kept here as reusable building blocks. |

Every generator file has a matching `*.spec.ts` — when adding a generator,
follow the existing spec style (construct a `GeneratorContext` +
`GeneratorConstraints`, assert on the returned `SwimSet[]` or `null`).

## 6. Pacing: CSS model (`pace_logic.ts`, `css_utils.ts`)

All target paces derive from **Critical Swim Speed (CSS)**, seconds per 100,
computed from a 400/200 time trial: `CSS = (t400 - t200) / 2`
(`calculateCSSPace` in `css_utils.ts`).

`EffortIntensity` (`easy` → `max-effort`) maps to an offset from CSS via
`getTargetPace`:

| Intensity | Offset from CSS | Zone |
| --- | --- | --- |
| `Easy` | +15s | Z1 Recovery |
| `ModerateEasy` | +6s | Z2 Endurance |
| `Normal` | +1s | Z3 Threshold |
| `Hard` | -3s | Z4 VO2 Max |
| `MaxEffort` | -6s | Z5 Sprint |

If `cssPace` isn't set, `getTargetPace` returns `null` and `fillSlot` falls
back to a flat 100s/100 pace so the app still works without a CSS test.

`getFocusIntensity(focus)` picks the *primary* intensity for a
`TrainingFocus` (e.g. `Speed` → `MaxEffort`, `Technique` → `Easy`).
`getRestSeconds(focus, distance, pace)` picks a rest interval per focus
(fixed for most; a 1:3 swim-time ratio for `Speed`).

## 7. Modality (`modality.ts`)

`Modality` (Swim/Pull/Kick/Drill/Hypoxic/Underwater) is a cross-cutting
constraint, independent of `SetStructure` (Basic/Pyramid/Ladder/Descending/
Build/Test) and stroke — this is the "structure vs. modality vs. stroke"
separation from the product spec.

- `isModalityAvailable(context, modality)` gates on gear + stroke
  preference (e.g. `Pull` needs pull buoy + paddles and `Pull` preference
  > 1).
- `applyModality(set, modality)` annotates a set with the gear it implies
  and appends a `(Pull)`/`(Kick)`/etc. suffix to its description.

## 8. Mutation / space traversal (`mutation.ts`)

`mutateWorkout` deep-clones a `Workout` and applies 1–2 random mutation
strategies to produce a "neighbor":

- `mutateStroke` — swaps one set's stroke for another available/weighted
  stroke (and rewrites the description's stroke word).
- `mutateStructure` — splits a rep (`1x200` → `2x100`), merges reps
  (`2x100` → `1x200`), or halves reps while doubling distance, keeping
  total distance constant.

Distance and tags are recalculated afterward. This backs the "explore
adjacent workouts" feature (`generateSimilar`) — cheaper than a full
regeneration and stays close to a workout the user already liked.

## 9. Tagging (`tagging.ts`)

`tagWorkout` derives display tags (`Endurance`, `Speed`, `Technique`,
`Hypoxic`, `Legs`, `Arms`, `Mixed`, `Long`/`Short`, ...) by keyword-matching
the main set's set descriptions plus a total-distance threshold. It's a
best-effort summary for history/favorites lists, not used by generation
logic itself.

## 10. Where the UI plugs in

`src/routes/+page.svelte` is the only caller of the public engine API
(`generateWorkoutOptions`, `generateSimilar`, `saveWorkout` from
`engine/actions.ts`). Generated `Workout[]` flow through `$state`, and
saving persists a `SavedWorkout` via `src/lib/stores/history.ts` →
`src/lib/utils/storage.ts` (localStorage, validated against
`SavedWorkoutSchema`).
