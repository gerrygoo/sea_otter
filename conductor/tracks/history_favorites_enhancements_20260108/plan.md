# Plan: History & Favorites Enhancements

This plan addresses the implementation of similarity generation, workout renaming, UI parity, and an investigation into the pre-set generation logic.

## Phase 1: UI Refactoring & Parity
Focus: Extracting the reusable WorkoutCard and updating History/Favorites lists.

- [x] Task: Create `src/lib/components/WorkoutCard.svelte` by extracting the card UI from `WorkoutPicker.svelte`.
- [x] Task: Refactor `WorkoutPicker.svelte` to use the new `WorkoutCard` component.
- [x] Task: Update `src/routes/history/+page.svelte` to use `WorkoutCard` for the list view.
- [x] Task: Update `src/routes/favorites/+page.svelte` to use `WorkoutCard` for the list view.
- [x] Task: Verify visually that History/Favorites now look identical to the Generator results.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: UI Refactoring & Parity' (Protocol in workflow.md)

## Phase 2: Workout Renaming & Actions
Focus: Adding the context menu, rename dialog, and storage updates.

- [ ] Task: Implement a `RenameDialog.svelte` component (simple modal).
- [ ] Task: Add `renameWorkout(id, newName)` method to `src/lib/stores/history.ts` and write unit tests in `src/lib/stores/history.spec.ts`.
- [ ] Task: Update `WorkoutCard.svelte` to support an optional "Actions Menu" (slot or prop).
- [ ] Task: Implement the "..." menu with a "Rename" option in the History/Favorites usage of `WorkoutCard`.
- [ ] Task: Wire up the Rename action to open the dialog and save the new name.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Workout Renaming & Actions' (Protocol in workflow.md)

## Phase 3: Similarity Generation
Focus: Generating variations from saved workouts.

- [ ] Task: Add "Generate Similar" button to `src/lib/components/WorkoutViewer.svelte` (used in Detail view).
- [ ] Task: Implement the handler to call `generateSimilar(workout)` (from existing engine) and navigate to the `WorkoutPicker` (or reuse the results view).
- [ ] Task: Verify that clicking "Generate Similar" correctly populates the results with new options.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Similarity Generation' (Protocol in workflow.md)

## Phase 4: Pre-set Investigation
Focus: Analyzing and deciding on the Pre-set slot.

- [ ] Task: Analyze `src/lib/engine/index.ts` and `src/lib/engine/types.ts` to see how `preset` is populated.
- [ ] Task: Create a test case in `src/lib/engine/preset_investigation.spec.ts` that specifically tries to trigger pre-set generation.
- [ ] Task: Document findings in `conductor/tracks/history_favorites_enhancements_20260108/preset_report.md` and propose a decision (Fix or Deprecate) to the user.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Pre-set Investigation' (Protocol in workflow.md)
