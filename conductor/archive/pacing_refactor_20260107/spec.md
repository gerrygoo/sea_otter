# Track Specification: Advanced Pacing Structures & Architectural Refactor

## Overview
This track introduces advanced pacing structures (Descending, Build, Test) to the workout engine and refactors the underlying architecture to separate "Structure" (the shape of the set), "Modality" (how it is swum/gear used), and "Stroke" (the swimming style). This refactor enables complex combinations such as a "Descending Pull Set."

## Functional Requirements
1.  **New Pacing Structures:**
    *   **Descending:** Repetition-to-repetition pace increase. The target time for each rep is faster than the previous one by a set decrement.
    *   **Build:** Intra-repetition acceleration. Swims start easy (Z1) and finish at max effort (Z5).
    *   **Test:** Max-effort time trials for specific distances (e.g., 400m). These sets require full recovery.
2.  **Architectural Refactor:**
    *   Decouple set logic so that any **Structure** (Basic, Pyramid, Ladder, Descending, Build, Test) can be combined with any **Modality** (Swim, Pull, Kick, Drill, Hypoxic, Underwater).
    *   Update `SwimSet` schema to include an explicit `modality` field and a `isTest` boolean flag.
3.  **Pacing Logic Update:**
    *   Ensure all target times and intervals for these new structures are derived mathematically from the user's CSS pace as defined in `workout_assembly.md`.

## Technical Requirements
*   **Schema Changes:**
    *   Add `modality` (Enum: `Swim`, `Pull`, `Kick`, `Drill`, `Hypoxic`, `Underwater`) to `SwimSetSchema`.
    *   Add `isTest: boolean` to `SwimSetSchema`.
    *   Add `structure` (Enum: `Basic`, `Pyramid`, `Ladder`, `Descending`, `Build`, `Test`) to `SwimSetSchema`.
*   **Engine Refactor:**
    *   Migrate existing generators (`Pyramid`, `Ladder`, `Pull`, `Kick`, etc.) to the new decoupled architecture.
    *   Implement logic for generating target times for `Descending` and `Build` structures.

## Acceptance Criteria
*   The engine can generate a workout containing a "Descending Pull Set" where target times decrease per rep.
*   "Test" sets are clearly flagged in the data structure with `isTest: true`.
*   A "Build" set's description clearly indicates the start and finish intensity (Z1 -> Z5).
*   All existing workout generation remains functional and uses the new decoupled schema.
*   Unit tests cover the combination of various structures and modalities.

## Out of Scope
*   UI implementation for inputting "Test" results (logged for future tracks).
*   Dynamic decrement calculation based on percentages (will use strict formulas per `workout_assembly.md`).

## Future Ideas
*   **Target Metrics (B):** Future expansion to allow sets to require specific user metrics like "stroke count" or "heart rate."
