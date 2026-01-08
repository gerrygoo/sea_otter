# Track Specification: Structured Warmup/Cooldown Protocols & Fix

## Overview
This track addresses the bug where Warmup/Cooldown segments are sometimes missing and implements a more sophisticated, multi-phase protocol for these segments based on competitive training principles.

## Functional Requirements
1.  **Mandatory Presence:**
    *   For workouts **≥ 40 minutes**, Warmup and Cooldown are MANDATORY.
    *   The engine must "steal" from the Main Set budget or use minimal fallbacks to ensure these segments exist.
    *   For workouts < 40 minutes, segments are scaled down or optional.
2.  **Structured Warm-Up (15-20% of Total Volume):**
    *   **Phase 1: Loosening (40-50% of Warm-up):** Z1 intensity, continuous or long reps (e.g., Choice Swim).
    *   **Phase 2: Activation (30-40% of Warm-up):** Neural engagement using a mix of Kick and Drill.
    *   **Phase 3: Priming (20% of Warm-up):** Focus-specific preparation.
        *   *Endurance/Threshold Focus:* Build sets (Z1 -> Z3).
        *   *Speed/Sprint Focus:* Variable speed (Fast breakouts).
3.  **Refined Cool-Down (10-15% of Total Volume):**
    *   Strictly Z1 intensity.
    *   **Lactate Flushing:** If Main Set intensity was > Z3 (Hard/MaxEffort), increase Cool-down volume toward the higher end of the range (15-20%) if time permits.

## Technical Requirements
*   **Engine Refactor (`src/lib/engine/index.ts`):**
    *   Update the orchestrator to enforce segment presence for ≥ 40 min durations.
    *   Implement the 3-phase Warmup logic within the `WarmupGenerators` or as a dedicated sequence in the orchestrator.
    *   Pass the Main Set focus/intensity to the Warmup/Cooldown generators to drive the branching logic.
*   **New Generators:**
    *   Implement a `ProtocolWarmupGenerator` that can handle the 3-phase structure.
    *   Implement a `ProtocolCooldownGenerator` that scales volume based on previous set intensity.

## Acceptance Criteria
*   Workouts ≥ 40 mins always have Warmup and Cooldown.
*   Warmups for "Speed" workouts contain "Fast Breakouts" or similar priming.
*   Warmups for "Endurance" workouts contain "Build" sets.
*   Cooldowns are strictly low intensity (Z1).
*   High-intensity workouts produce slightly longer cooldowns.

## Out of Scope
*   UI for editing individual phases of the warmup (controlled by the engine).
