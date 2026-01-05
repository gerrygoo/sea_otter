# Plan: Core Workout Generation Engine

## Phase 1: Foundation & Data Structures
*   [x] Task: Define TypeScript interfaces and enums for engine inputs and outputs 8de1c1f
*   [x] Task: Define 'SetGenerator' and 'Blueprint' interfaces to implement the 'Bucket & Filler' design b898f45
*   [x] Task: Create specific 'SetGenerators' for common swim patterns (Pyramid, Intervals, Ladder) a34bdaf
*   [x] Task: Implement basic utility functions for time/distance conversions and rounding logic 69188fc
*   [x] Task: Conductor - User Manual Verification 'Foundation & Data Structures' (Protocol in workflow.md) [checkpoint: d9f187d]

## Phase 2: Core Generation Logic
*   [x] Task: Implement 'hypoxicGenerator' (Lung Buster) to validate generator extensibility 203f12e
*   [x] Task: Write tests for the basic workout structure generation (Warm-up, Pre-set, Main Set, Cool-down) cdf85d6
*   [x] Task: Implement the high-level generation orchestrator cdf85d6
*   [x] Task: Write tests for the time-scaling algorithm (adjusting reps/sets to fit duration) 14fb80d
*   [x] Task: Implement the scaling logic to ensure workouts fit within user time constraints 14fb80d
*   [x] Task: Conductor - User Manual Verification 'Core Generation Logic' (Protocol in workflow.md) [checkpoint: deed856]

## Phase 3: Gear & Focus Filtering
*   [x] Task: Write tests for gear-based exercise filtering f031791
*   [x] Task: Implement logic to filter the set library based on available user equipment f031791
*   [ ] Task: Write tests for training-focus prioritization (e.g., more speed sets for 'Speed' focus)
*   [ ] Task: Implement focus-based weighting for set selection
*   [ ] Task: Conductor - User Manual Verification 'Gear & Focus Filtering' (Protocol in workflow.md)

## Phase 4: Final Integration & Serialization
*   [ ] Task: Write comprehensive integration tests for end-to-end workout generation
*   [ ] Task: Refactor and optimize the engine for performance and readability
*   [ ] Task: Implement JSON serialization and schema validation for the output
*   [ ] Task: Conductor - User Manual Verification 'Final Integration & Serialization' (Protocol in workflow.md)
