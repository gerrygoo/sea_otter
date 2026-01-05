# Plan: Core Workout Generation Engine

## Phase 1: Foundation & Data Structures
*   [x] Task: Define TypeScript interfaces and enums for engine inputs and outputs 8de1c1f
*   [ ] Task: Create a curated library of swim set templates and drills as static constants
*   [ ] Task: Implement basic utility functions for time/distance conversions (e.g., yards to meters, pace calculations)
*   [ ] Task: Conductor - User Manual Verification 'Foundation & Data Structures' (Protocol in workflow.md)

## Phase 2: Core Generation Logic
*   [ ] Task: Write tests for the basic workout structure generation (Warm-up, Pre-set, Main Set, Cool-down)
*   [ ] Task: Implement the high-level generation orchestrator
*   [ ] Task: Write tests for the time-scaling algorithm (adjusting reps/sets to fit duration)
*   [ ] Task: Implement the scaling logic to ensure workouts fit within user time constraints
*   [ ] Task: Conductor - User Manual Verification 'Core Generation Logic' (Protocol in workflow.md)

## Phase 3: Gear & Focus Filtering
*   [ ] Task: Write tests for gear-based exercise filtering
*   [ ] Task: Implement logic to filter the set library based on available user equipment
*   [ ] Task: Write tests for training-focus prioritization (e.g., more speed sets for 'Speed' focus)
*   [ ] Task: Implement focus-based weighting for set selection
*   [ ] Task: Conductor - User Manual Verification 'Gear & Focus Filtering' (Protocol in workflow.md)

## Phase 4: Final Integration & Serialization
*   [ ] Task: Write comprehensive integration tests for end-to-end workout generation
*   [ ] Task: Refactor and optimize the engine for performance and readability
*   [ ] Task: Implement JSON serialization and schema validation for the output
*   [ ] Task: Conductor - User Manual Verification 'Final Integration & Serialization' (Protocol in workflow.md)
