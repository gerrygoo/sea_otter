# Plan: Workout Detail & Re-use

## Phase 1: Component Refactoring
*   [x] Task: Extract the workout display logic from 'src/routes/+page.svelte' into 'src/lib/components/WorkoutViewer.svelte' b3008dc
*   [x] Task: Update the Generator page to use the new 'WorkoutViewer' component b3008dc
*   [x] Task: Conductor - User Manual Verification 'Component Refactoring' (Protocol in workflow.md) [checkpoint: efa8f62]

## Phase 2: Detail View Implementation
*   [x] Task: Implement the dynamic route 'src/routes/history/[id]/+page.svelte' 013872b
*   [x] Task: Implement logic to look up the workout ID from the history store 013872b
*   [x] Task: Update 'WorkoutCard' to link to the detail page 013872b
*   [x] Task: Conductor - User Manual Verification 'Detail View Implementation' (Protocol in workflow.md) [checkpoint: 7cbf3bd]
