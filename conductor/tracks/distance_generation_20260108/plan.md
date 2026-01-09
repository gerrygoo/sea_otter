# Plan: Distance-Based Workout Generation & Integrity

This plan covers the implementation of distance-based workout generation and the fix for "Distance Integrity" (ensuring workouts return to the starting wall).

## Phase 1: Core Engine Updates (Logic & Validation) [checkpoint: 679a910]
Focus: Updating the engine to handle distance parameters and rounding logic.

- [x] Task: Update `WorkoutConstraints` schema in `src/lib/engine/types.ts` to support optional `targetDistance`.
- [x] Task: Implement `roundToNearestWall` utility in `src/lib/engine/utils.ts` and write tests in `src/lib/engine/utils.spec.ts`.
- [x] Task: Update `generateWorkout` in `src/lib/engine/index.ts` to handle the distance-based scaling path.
- [x] Task: Write unit tests in `src/lib/engine/distance_generation.spec.ts` to verify rounding and scaling logic.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Engine Updates' (Protocol in workflow.md) [679a910]

## Phase 2: Block-Level Distance Distribution [checkpoint: cac08ff]
Focus: Ensuring Warm-up, Main Set, and Cool Down blocks adhere to the new distance constraints.

- [x] Task: Update block generators (Warm-up, Main Set, Cool Down) to accept distance targets.
- [x] Task: Implement logic to ensure the sum of all blocks equals the adjusted target distance.
- [x] Task: Write tests in `src/lib/engine/integration.spec.ts` to verify total workout distance is always a multiple of `2 * poolLength`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Block-Level Distance Distribution' (Protocol in workflow.md) [cac08ff]

## Phase 3: UI Implementation [checkpoint: df7bdfc]
Focus: Adding the toggle and distance input to the Generator Form.

- [x] Task: Update `GeneratorForm.svelte` to include the Time/Distance toggle.
- [x] Task: Update state management to handle the toggled input unit.
- [x] Task: Ensure the UI correctly displays the rounded "Actual Target" when a non-multiple distance is entered.
- [x] Task: Update `GeneratorForm.svelte.spec.ts` with component tests for the new toggle.
- [x] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation' (Protocol in workflow.md) [df7bdfc]

## Phase 4: Final Integration & E2E [checkpoint: 3aa0b29]
Focus: Verifying the end-to-end flow.

- [x] Task: Run full suite of engine and UI tests.
- [x] Task: Add a Playwright E2E test in `e2e/distance_flow.test.ts` for generating a distance-based workout.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Integration & E2E' (Protocol in workflow.md) [3aa0b29]
