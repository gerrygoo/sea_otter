# Specification: Distance-Based Workout Generation & Integrity

## Overview
This track introduces the ability for users to generate workouts based on a total target distance (e.g., 2000m) instead of total duration. It also addresses a critical bug where generated workouts did not consistently respect pool length constraints, ensuring that all workouts result in the swimmer returning to the starting wall.

## Functional Requirements
1.  **Distance-Based Input:**
    *   Add a toggle in the Generator Form to switch between "Time" and "Distance" constraints.
    *   When "Distance" is selected, the input field unit changes to meters/yards (matching pool configuration).
2.  **Distance-Driven Generation:**
    *   Modify the engine to accept a `targetDistance` parameter.
    *   Distribute the distance across blocks based on existing logic: Warm-up (15-20%), Main Set (60-70%), Cool Down (10-15%).
3.  **Distance Integrity (Wall Return):**
    *   Ensure the **Total Workout Distance** is always a multiple of `2 * poolLength`.
    *   If a user inputs a target distance that is not a multiple of `2 * poolLength`, the engine must automatically **round down** to the nearest valid multiple.
    *   Individual sets/repeats can still be odd lengths (e.g., 75m in a 25m pool), provided the *total* sum is even.

## Non-Functional Requirements
*   **Accuracy:** The generated workout distance should be within +/- 5% of the adjusted target distance.
*   **UI Consistency:** The toggle should feel native to the existing Material Design/Tailwind UI.

## Acceptance Criteria
*   [ ] User can toggle between Time and Distance in the UI.
*   [ ] Generating a 2000m workout in a 25m pool results in a workout with a total distance of exactly 2000m.
*   [ ] Generating a 2010m workout in a 25m pool results in a workout with a total distance of 2000m.
*   [ ] All generated workouts, regardless of generation mode, result in a total distance that is a multiple of `2 * poolLength`.

## Out of Scope
*   Allowing users to manually define distances for individual blocks (Warm-up vs Main Set).
*   Enforcing that every individual repeat is a multiple of `2 * poolLength` (odd lengths are still allowed as long as they sum correctly).
