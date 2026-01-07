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

## Phase 2: Adjacency & Mutation Engine

### Task 3: Mutation Logic
- [ ] Task: Create a `mutateWorkout(workout: Workout, params: WorkoutParameters): Workout` function.
- [ ] Task: Implement specific mutators:
    - `mutateStructure`: Change set patterns (e.g., breaking 200s into 100s).
    - `mutateStroke`: Swap strokes based on preferences.
- [ ] Task: Write Tests: Verify that mutated workouts are valid (pass schema) and different from the original.

### Task 4: Integration
- [ ] Task: Expose `generateSimilar(workout: Workout, count: number)` in the public engine API.

### Phase 2 Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Adjacency & Mutation Engine' (Protocol in workflow.md)

## Phase 3: UI - Selection & Exploration

### Task 5: Workout Picker Component
- [ ] Task: Create `WorkoutPicker.svelte` to display multiple workout cards.
- [ ] Task: Implement summary view for cards (Distance, Time, Tags, Main Set description).
- [ ] Task: Update `routes/+page.svelte` to show Picker state before Viewer state.

### Task 6: Traversal Interactions
- [ ] Task: Add "Find Similar" / "Variations" button to the Picker and/or Viewer.
- [ ] Task: Wire up the button to call `generateSimilar` and update the Picker list.

### Task 7: UI Polish
- [ ] Task: Ensure mobile responsiveness (horizontal scrolling for cards).
- [ ] Task: Improve "Pyramid part" descriptions (clean up legacy string formatting).

### Phase 3 Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI - Selection & Exploration' (Protocol in workflow.md)
