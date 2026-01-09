# Specification: History & Favorites Enhancements

## Overview
This track focuses on improving the utility and visual consistency of the History and Favorites features. It introduces the ability to generate "similar" workouts from saved items, allows users to rename saved sessions, and ensures the UI for saved workouts matches the rich detail of newly generated ones. It also includes an investigation into the "Pre-set" generation logic.

## Functional Requirements
1.  **Similarity Generation:**
    *   Add a "Generate Similar" action to the Workout Detail view for any workout in History or Favorites.
    *   This action will use the existing `mutateWorkout` or similar engine logic to produce 3 new variations based on the current workout's parameters.
2.  **Workout Renaming:**
    *   Implement a "..." context menu on workout cards in History and Favorites.
    *   Add a "Rename" option to this menu.
    *   Renaming should open a simple dialog/modal to input the new name.
    *   Persist the name update in local storage.
3.  **UI Parity & Refactoring:**
    *   Refactor the workout card design currently embedded in `WorkoutPicker.svelte` into a standalone `WorkoutCard.svelte` component.
    *   Use this new `WorkoutCard.svelte` component in the History and Favorites list views.
    *   The card should include tags, a preview of the main set, and summary text for warmup/cooldown.
4.  **Pre-set Investigation:**
    *   Investigate the current state of "Pre-set" generation in the engine.
    *   Determine if any generators currently target the `preset` slot.
    *   If valuable, fix/re-enable; otherwise, document the decision to rely on advanced Warmup logic and consider future deprecation.

## Technical Requirements
*   Update `HistoryStore` to support a `renameWorkout(id, newName)` action.
*   The `WorkoutCard` component must handle both "Selection" mode (for new workouts) and "Management" mode (for saved workouts).

## Acceptance Criteria
*   [ ] User can click "Generate Similar" on a history item and see 3 new variations.
*   [ ] User can rename a workout via a menu on the card, and the name persists after reload.
*   [ ] History and Favorites lists display workouts using the detailed card design (tags, main set preview).
*   [ ] Report produced on the status and value of the "Pre-set" generation slot.

## Out of Scope
*   Batch deletion of history items.
*   Exporting history to external formats (Garmin integration is a separate track).
