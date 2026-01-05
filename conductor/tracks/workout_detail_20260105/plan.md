# Plan: Workout Detail & Re-use

## Phase 1: Component Refactoring
*   [ ] Task: Extract the workout display logic from 'src/routes/+page.svelte' into 'src/lib/components/WorkoutViewer.svelte'
*   [ ] Task: Update the Generator page to use the new 'WorkoutViewer' component
*   [ ] Task: Conductor - User Manual Verification 'Component Refactoring' (Protocol in workflow.md)

## Phase 2: Detail View Implementation
*   [ ] Task: Implement the dynamic route 'src/routes/history/[id]/+page.svelte'
*   [ ] Task: Implement logic to look up the workout ID from the history store
*   [ ] Task: Update 'WorkoutCard' to link to the detail page
*   [ ] Task: Conductor - User Manual Verification 'Detail View Implementation' (Protocol in workflow.md)
