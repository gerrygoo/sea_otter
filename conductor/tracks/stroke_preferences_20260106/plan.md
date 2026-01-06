# Plan: Stroke Preferences

## Phase 1: Types & Schema [checkpoint: 2a611e7]
- [x] Task: Update `StrokeStyle` enum and add `StrokePreference` type in `src/lib/engine/types.ts` eed607e
- [x] Task: Update `WorkoutParameters` and `GeneratorContext` to include `strokePreferences` eed607e
- [x] Task: Update Zod schemas in `src/lib/engine/schema.ts` to reflect preference changes 59b2b13
- [ ] Task: Conductor - User Manual Verification 'Types & Schema' (Protocol in workflow.md)

## Phase 2: User Interface Implementation
- [x] Task: Create or update a UI component for stroke preference segmented controls bedcf9e
- [x] Task: Integrate stroke preferences into `GeneratorForm.svelte` with appropriate labels 1fb4799
- [x] Task: Ensure stroke preferences are persisted in `localStorage` via the history/settings store 5d8622f
- [ ] Task: Conductor - User Manual Verification 'User Interface Implementation' (Protocol in workflow.md)

## Phase 3: Engine Logic - Filtering & Weighting
- [ ] Task: Implement "Never" (1) exclusion logic in the workout generation engine
- [ ] Task: Implement weighting logic for preferences 2-5 to influence stroke selection frequency
- [ ] Task: Implement "Smart Fallback" logic for cases where all strokes are disabled
- [ ] Task: Conductor - User Manual Verification 'Engine Logic - Filtering & Weighting' (Protocol in workflow.md)

## Phase 4: Engine Logic - Drill Alignment
- [ ] Task: Update drill selection logic to prioritize drills matching high-preference (4-5) strokes
- [ ] Task: Ensure gear requirements are still respected when selecting stroke-specific drills
- [ ] Task: Conductor - User Manual Verification 'Engine Logic - Drill Alignment' (Protocol in workflow.md)

## Phase 5: Verification & Cleanup
- [ ] Task: Comprehensive unit testing for all preference-based generation scenarios
- [ ] Task: End-to-end verification of UI state persistence and engine responsiveness
- [ ] Task: Conductor - User Manual Verification 'Verification & Cleanup' (Protocol in workflow.md)
