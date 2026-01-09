# Pre-set Generation Investigation Report

## Findings
The "Pre-set" section is currently non-functional in the generation engine for the following reasons:

1.  **Missing from Blueprint:** The `StandardBlueprint` used by the `generateWorkout` orchestrator only contains slots for `warmup`, `mainSet`, and `cooldown`.
2.  **No Assigned Generators:** Even if the slot were added to the blueprint, there are no generators currently assigned to it.
3.  **Redundancy:** The current `protocolWarmupGenerator` is highly advanced, including "Activation" and "Priming" phases that effectively serve the purpose of a traditional swimming pre-set (technical/activation work before the main effort).

## Recommendation: Deprecate
I recommend **deprecating and removing** the `preset` slot from the engine and UI. 

**Why?**
*   The current 3-block structure (Warmup, Main, Cooldown) is clean and well-understood.
*   "Pre-set" logic is already effectively covered within the `warmup` block's activation/priming phases.
*   Adding a 4th block complicates the "Bucket & Filler" heuristic and distance distribution math without adding significant training value.

## Proposed Action
1.  Remove `preset` from `Workout` and `SavedWorkout` interfaces in `src/lib/engine/types.ts`.
2.  Remove `preset` initialization and assembly in `src/lib/engine/index.ts`.
3.  Remove `preset` rendering from `src/lib/components/WorkoutViewer.svelte` and `WorkoutPicker.svelte`.
