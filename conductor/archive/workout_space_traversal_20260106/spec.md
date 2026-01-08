# Track Specification: Workout Space Traversal & Multi-Option Generation

## Overview
This track aims to unlock the full potential of the workout generation engine by moving away from a single deterministic output to a "Generative Space" model. Users should be presented with multiple, distinct workout options derived from their constraints. Furthermore, the system should allow users to explore this space by generating "adjacent" workouts—variations that are similar to a selected workout but with slight twists (e.g., different strokes, slightly different intensities, or modified sets), effectively allowing them to traverse the workout possibility space.

## User Stories
- As a swimmer, I want to see 3-5 different workout options for my selected parameters so that I can choose the one that feels right for today.
- As a swimmer, I want to request "similar but different" workouts based on one I like (e.g., "Give me another one like this"), so I can maintain a training theme without doing the exact same set every time.
- As a swimmer, I want to clearly see the differences between the presented options (e.g., "More Intensity", "More Drill", "Balanced") to make an informed choice.

## Functional Requirements

### 1. Engine Enhancements
- **Multi-Generation:** The `generateWorkout` function must be capable of producing a collection of unique workouts (`Workout[]`) rather than a single one.
- **Variety Heuristics:**
    - The engine must employ strategies to ensure the generated options are *distinct* (e.g., varying the "Main Set" structure, changing the stroke emphasis within the allowed preferences, or shifting the intensity distribution).
    - It should ideally tag these variations (e.g., "Endurance Heavy", "Sprint Focus", "Technique Mix").
- **Adjacency/Similarity Engine:**
    - New capability to take an existing `Workout` (or its seed seed/params) and generate neighbors.
    - **Mutation Strategies:**
        - **Scale Mutation:** Slightly adjust distances/reps (e.g., 4x100 -> 8x50).
        - **Stroke Mutation:** Swap strokes where allowed (e.g., Free -> Pull).
        - **Pattern Mutation:** Change the pattern type (e.g., Pyramid <-> Ladder) if compatible.

### 2. User Interface Updates
- **Selection View:**
    - After clicking "Generate", instead of going straight to the viewer, show a "Workout Picker" carousel or grid.
    - Each option should show a summary: Total Distance, Duration, Main Set Focus, and a "Vibe" tag.
- **Traversal Controls:**
    - In the Workout Viewer (or Picker), add a "Show Similar" or "Variations" button.
    - This triggers the generation of adjacent workouts and updates the selection view.

## Non-Functional Requirements
- **Performance:** Generating 3-5 workouts shouldn't take perceivably longer (>1s) than generating one.
- **Responsiveness:** The Picker UI must be smooth and mobile-friendly (horizontal swipe preferred for cards).

## Acceptance Criteria
- [ ] The engine returns at least 3 distinct workout options for standard parameters.
- [ ] Users can browse these options in the UI.
- [ ] Users can select an option to view full details.
- [ ] Users can trigger a "Generate Similar" action which returns valid variations of the current workout.
- [ ] "Adjacent" workouts preserve the core characteristics (duration, intensity) of the original while changing specific elements.

## Out of Scope
- Full "Infinite Zoom" or complex visual map of the workout space.
- Machine Learning / AI-based personalization (heuristic-based for now).
