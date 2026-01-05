# Specification: Workout Detail & Re-use

## Overview
This track focuses on the "Read" and "Re-use" aspects of the Saved Workouts feature. Currently, users can see a summary list of history, but they cannot click through to see the full details of a past workout (e.g., the specific interval times or drill instructions) or re-run it.

## User Stories
*   As a swimmer, I want to tap on a workout in my History or Favorites to see its full details.
*   As a swimmer, I want to see the same breakdown (Warm-up, Main Set, etc.) for a saved workout as I do for a newly generated one.
*   As a swimmer, I want a "Do this workout again" button that loads the workout so I can use it for my current session.

## Functional Requirements
*   **Routing:** Create a dynamic route `src/routes/history/[id]/+page.svelte`.
*   **Data Retrieval:** The page must retrieve the specific workout from the `history` store based on the route `id` parameter.
*   **UI:** Reuse the existing "Workout Display" logic (from the Generator page) to render the saved workout. ideally by extracting it into a `WorkoutDetail` component.
*   **Navigation:** Update `WorkoutCard` to link to this new detail view.
*   **Action:** Add a "Back" button to return to the list.

## Technical Constraints
*   **Refactoring:** Extract the display logic from `src/routes/+page.svelte` into a reusable `WorkoutViewer.svelte` component to ensure consistency between the Generator and History views.

## Acceptance Criteria
*   Clicking a card in History/Favorites navigates to `/history/[id]`.
*   The detail view renders the full workout correctly.
*   If the ID is not found, show a "Workout not found" message with a redirect link.
