# Plan: Advanced Pacing Structures & Architectural Refactor

## Phase 1: Schema Updates & Core Types [checkpoint: b70fe2c]
- [x] Task: Update `SwimSet` and `Generator` interfaces in `src/lib/engine/types.ts` b70fe2c
    - Add `Modality` enum (`Swim`, `Pull`, `Kick`, `Drill`, `Hypoxic`, `Underwater`)
    - Add `SetStructure` enum (`Basic`, `Pyramid`, `Ladder`, `Descending`, `Build`, `Test`)
    - Update `SwimSet` interface to include optional `modality` (default 'Swim'), `structure` (default 'Basic'), and `isTest` (default false)
    - [x] Sub-task: Update `schema.ts` (Zod schemas) to match the new types b70fe2c
    - [x] Sub-task: Update `workout_assembly.md` reference documentation with new enums b70fe2c
- [x] Task: Create new test file `src/lib/engine/schema_refactor.spec.ts` b70fe2c
    - Write tests to verify new schema validation passes for valid sets with new fields
    - Write tests to verify it fails for invalid enum values
- [x] Task: Conductor - User Manual Verification 'Schema Updates & Core Types' (Protocol in workflow.md) b70fe2c

## Phase 2: Engine Refactor (Decoupling) [checkpoint: 174040c]
- [x] Task: Refactor `pace_logic.ts` 174040c
    - Implement `getDescendingTargetTimes(cssPace, distance, reps, decrement)`
    - Implement logic for `Build` intensity strings (e.g., "Z1 -> Z5")
- [x] Task: Refactor `generators/basic.ts` to support Modality injection 174040c
    - Update `basicIntervalGenerator` to accept a `modality` constraint/parameter
- [x] Task: Refactor `generators/gear.ts` (Pull/Kick) 174040c
    - **CRITICAL:** Deprecate standalone `pullGenerator` and `kickGenerator`.
    - Create a `ModalityApplicator` or updated logic that applies "Pull" gear/stroke constraints to *any* structure.
- [x] Task: Update `generators/patterns.ts` (Pyramid/Ladder) 174040c
    - Update generators to set `structure: 'Pyramid'` / `'Ladder'` in output
    - Allow them to accept `modality` arguments to generate "Pyramid Kick", etc.
- [x] Task: Conductor - User Manual Verification 'Engine Refactor (Decoupling)' (Protocol in workflow.md) 174040c

## Phase 3: New Pacing Structures
- [ ] Task: Create `generators/descending.ts`
    - Implement `descendingGenerator` that creates sets with decreasing target times
    - [ ] Sub-task: Write unit tests in `descending.spec.ts`
- [ ] Task: Create `generators/build.ts`
    - Implement `buildGenerator` for intra-rep acceleration
    - [ ] Sub-task: Write unit tests in `build.spec.ts`
- [ ] Task: Create `generators/test_sets.ts`
    - Implement `testSetGenerator` for max effort sets (e.g., 400m CSS Test)
    - Ensure `isTest: true` is set
    - [ ] Sub-task: Write unit tests in `test_sets.spec.ts`
- [ ] Task: Conductor - User Manual Verification 'New Pacing Structures' (Protocol in workflow.md)

## Phase 4: Integration & Cleanup
- [ ] Task: Update `src/lib/engine/index.ts` (Orchestrator)
    - Register new generators (`Descending`, `Build`, `Test`)
    - Update logic to mix-and-match Structure + Modality based on user preferences (e.g., if User likes Pull, generate a Descending Pull set)
- [ ] Task: Update `src/lib/components/WorkoutViewer.svelte`
    - Display new `structure` and `modality` fields (e.g., badges or text prefix)
    - Highlight `Test` sets visually
- [ ] Task: Verify all legacy tests pass
    - Run full test suite and fix any regressions in existing specs
- [ ] Task: Conductor - User Manual Verification 'Integration & Cleanup' (Protocol in workflow.md)
