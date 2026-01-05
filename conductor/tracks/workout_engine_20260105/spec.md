# Specification: Core Workout Generation Engine

## Overview
This track focuses on the foundational logic of the Sea Otter application: the workout generation engine. The engine will be a pure TypeScript module designed to be extensible, testable, and capable of generating structured swimming workouts based on user-defined parameters.

## User Stories
*   As a swimmer, I want to input my available gear (Fins, Kickboard, Pull Buoy, Paddles, Snorkel) so the engine only suggests relevant drills.
*   As a swimmer, I want to set a target total time for my session so the workout fits my schedule.
*   As a swimmer, I want to select a training focus (Endurance, Speed, Technique, etc.) to align with my fitness goals.

## Functional Requirements
*   **Parameter Support:** The engine must accept and process:
    *   Pool size (e.g., 25 yards, 25 meters, 50 meters).
    *   Total available time (minutes).
    *   Available gear (boolean flags for each tool).
    *   Training focus (enum/string).
*   **Workout Structure:** Every generated workout must include:
    *   Warm-up
    *   Pre-set (drills/technical focus)
    *   Main Set (the core of the workout)
    *   Cool-down
*   **Dynamic Scaling:** The engine must adjust the number of repetitions and distances within sets to fit the total time constraint.
*   **Serialization:** The generated workout object must be serializable to JSON.

## Technical Constraints
*   **Logic Isolation:** The engine must be implemented as pure TypeScript functions/classes, independent of the Svelte UI.
*   **Test-Driven Development:** Core logic must be developed using TDD with Vitest.
*   **Static Assets:** Initial "set templates" or "drill libraries" can be stored as static JSON or TypeScript constants.

## Acceptance Criteria
*   The engine can generate a valid, structured workout object for any combination of valid input parameters.
*   The total estimated duration of the generated workout does not exceed the user-defined time limit.
*   The workout only includes exercises that utilize the user's available gear.
*   Unit tests cover at least 80% of the engine's logic.
