# Implementation Plan - Workout Space Traversal

This plan breaks down the "Generative Space" feature into engine core updates, adjacency logic, and UI implementation.

## Phase 1: Engine Core - Multi-Generation [checkpoint: 72c2e0c]

### Task 1: Refactor Generation Entry Point
- [x] Task: Update `generateWorkout` (or create `generateOptions`) to accept a `count` parameter and return `Workout[]`. [f5b89c2]
- [x] Task: Implement a "Variance Strategy" in the engine to ensure generated options are not identical (e.g., forcing different Main Set generators or forcing different Stroke selections). [f5b89c2]
- [x] Task: Write Tests: Verify that calling the generator multiple times produces distinct results (using seeded RNG if necessary for determinism in tests). [f5b89c2]

### Task 2: Workout Tagging/Analysis
- [x] Task: Implement a helper to analyze a generated workout and assign tags (e.g., "Sprint", "Distance", "Mixed"). [6d1d6b8]
- [x] Task: Ensure these tags are included in the returned workout object for UI display. [6d1d6b8]

### Phase 1 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 1: Engine Core - Multi-Generation' (Protocol in workflow.md) [72c2e0c]

## Phase 2: Adjacency & Mutation Engine [checkpoint: 2d82674]

### Task 3: Mutation Logic
- [x] Task: Create a `mutateWorkout(workout: Workout, params: WorkoutParameters): Workout` function. [2d82674]
- [x] Task: Implement specific mutators:
    - `mutateStructure`: Change set patterns (e.g., breaking 200s into 100s). [2d82674]
    - `mutateStroke`: Swap strokes based on preferences. [2d82674]
- [x] Task: Write Tests: Verify that mutated workouts are valid (pass schema) and different from the original. [2d82674]

### Task 4: Integration
- [x] Task: Expose `generateSimilar(workout: Workout, count: number)` in the public engine API. [2d82674]

### Phase 2 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 2: Adjacency & Mutation Engine' (Protocol in workflow.md) [cb88954]

## Phase 3: UI - Selection & Exploration [checkpoint: be16056]

### Task 5: Workout Picker Component
- [x] Task: Create `WorkoutPicker.svelte` to display multiple workout cards. [be16056]
- [x] Task: Implement summary view for cards (Distance, Time, Tags, Main Set description). [be16056]
- [x] Task: Update `routes/+page.svelte` to show Picker state before Viewer state. [be16056]

### Task 6: Traversal Interactions
- [x] Task: Add "Find Similar" / "Variations" button to the Picker and/or Viewer. [be16056]
- [x] Task: Wire up the button to call `generateSimilar` and update the Picker list. [be16056]

### Task 7: UI Polish
- [x] Task: Ensure mobile responsiveness (horizontal scrolling for cards). [be16056]
- [x] Task: Improve "Pyramid part" descriptions (clean up legacy string formatting). [be16056]

### Phase 3 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 3: UI - Selection & Exploration' (Protocol in workflow.md) [be16056]

## Phase 4: User Feedback & Refinement [checkpoint: f157a4a]

### Task 8: Generator Options Input
- [x] Task: Update `WorkoutParameters` interface to include `optionCount` (default 3). [f157a4a]
- [x] Task: Update `GeneratorForm.svelte` to allow user to select number of options (e.g., 1-5). [f157a4a]
- [x] Task: Pass this parameter to `generateWorkoutOptions`. [f157a4a]

### Task 9: Workout Picker Redesign
- [x] Task: Update `WorkoutPicker.svelte` to show fuller details (perhaps reusable `WorkoutViewer` components inside, or expanded cards). [f157a4a]
- [x] Task: Change layout to a vertical scrollable list for easier comparison. [f157a4a]

### Phase 4 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 4: User Feedback & Refinement' (Protocol in workflow.md) [f157a4a]

## Phase 5: Bug Fixes & Polish [checkpoint: 7f2a387]

### Task 10: Fix Unit Display
- [x] Task: Add `poolUnit` to `Workout` interface. [7f2a387]
- [x] Task: Populate `poolUnit` in `generateWorkout`. [7f2a387]
- [x] Task: Update `WorkoutPicker` and `WorkoutViewer` to display correct unit (yds/m). [7f2a387]

### Phase 5 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 5: Bug Fixes & Polish' (Protocol in workflow.md) [7f2a387]

## Phase 6: Final Polish [checkpoint: bcfa986]

### Task 11: Content & Branding
- [x] Task: Update site title to "Swimming Generator". [bcfa986]
- [x] Task: Replace favicon with a custom SVG (e.g., wave/swimmer icon). [bcfa986]
- [x] Task: Increase generator option limit to 10. [bcfa986]

### Task 12: Detailed Breakdown
- [x] Task: Fix units in `WorkoutPicker` breakdown (remove hardcoded 'y'). [bcfa986]
- [x] Task: Enhance breakdown to show stroke distribution (e.g. "Warmup: 400m (Free/Back)" instead of just distance). [bcfa986]

### Phase 6 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 6: Final Polish' (Protocol in workflow.md) [bcfa986]

## Phase 7: Warmup Variety [checkpoint: 9c67890]

### Task 13: Dedicated Warmup Generators
- [x] Task: Create `src/lib/engine/generators/warmup.ts`. [9c67890]
- [x] Task: Implement `mixedWarmupGenerator` (e.g. 200 Swim, 100 Kick, 100 Pull). [9c67890]
- [x] Task: Implement `pyramidWarmupGenerator` (e.g. 100, 200, 100). [9c67890]
- [x] Task: Register new generators in `src/lib/engine/index.ts` and ensure randomization. [9c67890]

### Phase 7 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 7: Warmup Variety' (Protocol in workflow.md) [9c67890]
