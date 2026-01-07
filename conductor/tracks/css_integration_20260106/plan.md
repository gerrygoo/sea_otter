# Implementation Plan - Critical Swim Speed (CSS) Integration

This plan outlines the steps to integrate Critical Swim Speed (CSS) into the workout generation engine and implement local storage persistence for user settings.

## Phase 1: Core Logic & Persistence

### Task 1: Update Schema and Types
- [x] Task: Update Zod schema for `GeneratorForm` to include CSS parameters.
- [x] Task: Update TypeScript types to reflect schema changes.

### Task 2: Implement Local Storage Persistence
- [x] Task: Create/Update persistence layer (Svelte store or utility) to sync form state with `localStorage`.
- [x] Task: Write Tests: Verify data is saved and loaded correctly from `localStorage`.
- [x] Task: Implement: Connect `GeneratorForm` state to persistent storage.

### Task 3: CSS Calculation Logic
- [ ] Task: Write Tests: Verify CSS calculation formula `(400 - 200) / (400m_time - 200m_time)` (adjusted for units).
- [ ] Task: Implement: CSS calculation utility function.

### Phase 1 Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Logic & Persistence' (Protocol in workflow.md)

## Phase 2: Engine Integration

### Task 4: Update Generation Engine
- [ ] Task: Write Tests: Verify engine accepts `cssPace` and applies intensity scaling (Neutral, Easy, Hard).
- [ ] Task: Implement: Update workout generation logic to calculate set-specific target times based on CSS.

### Task 5: Pace Formatting Utility
- [ ] Task: Write Tests: Verify formatting of target times (e.g., 90 seconds -> "1:30").
- [ ] Task: Implement: Utility to format duration for display.

### Phase 2 Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Engine Integration' (Protocol in workflow.md)

## Phase 3: UI Implementation

### Task 6: Update Generator Form UI
- [ ] Task: Implement "Performance (CSS)" section in `GeneratorForm.svelte`.
- [ ] Task: Implement toggle for Manual Entry vs. Calculator.
- [ ] Task: Connect UI inputs to the persistent store.

### Task 7: Update Workout Viewer UI
- [ ] Task: Implement display of target times in `WorkoutCard.svelte` or `WorkoutViewer.svelte`.
- [ ] Task: Apply color coding based on intensity relative to CSS (Blue/Green/Red).

### Phase 3 Verification
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Implementation' (Protocol in workflow.md)
