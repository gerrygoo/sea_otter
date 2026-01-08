# Implementation Plan - Duration Optimization

## Phase 1: Generator Scaling [checkpoint: 9c67890]

### Task 1: Enhance Pattern Generators
- [x] Task: Update `pyramidGenerator` in `src/lib/engine/generators/patterns.ts` to include larger variations (e.g. up to 400/500) and logic to repeat the pyramid (e.g. 2x) if budget allows. [9c67890]
- [x] Task: Update `ladderGenerator` to support longer ladders or multiple rounds. [9c67890]

### Task 2: Verify Scaling
- [x] Task: Write tests in `src/lib/engine/scaling.spec.ts` (update/expand) to verify that for 60min+ budgets, these generators produce >45min content. [9c67890]

## Phase 2: Budgeting Intelligence [checkpoint: ef2de95]

### Task 3: Slack Utilization
- [x] Task: Modify `generateWorkout` in `src/lib/engine/index.ts`. If `mainSet` leaves significant time, relax the budget caps for Warmup/Preset/Cooldown to use some of it (e.g., allow Warmup to go up to 20% or 25% if plenty of time remains). [ef2de95]
- [x] Task: Add a "Fill" logic? If we are still under time, add an easy "Swim Down" extension to the cooldown. [ef2de95]

### Phase 2 Verification
- [x] Task: Conductor - User Manual Verification 'Phase 2: Budgeting Intelligence' (Protocol in workflow.md) [ef2de95]
