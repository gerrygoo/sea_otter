# Specification: Stroke Preferences

## Overview
Currently, the workout generation engine uses hardcoded or randomized stroke selection. This track introduces a user-facing preference system (1-5 scoring) to allow users to control the frequency and inclusion of specific strokes (Freestyle, Backstroke, Breaststroke, Butterfly, IM/Mix, Drill, and Kick) in their generated workouts.

## Functional Requirements

### 1. Preference Model
- Implement a preference schema for each stroke type:
    - `1`: Never (Exclude)
    - `2`: Rarely (Low probability/volume)
    - `3`: Occasionally (Balanced probability/volume)
    - `4`: Often (High probability/volume)
    - `5`: Primary Focus (Maximum probability/volume)

### 2. User Interface
- Add a "Stroke Preferences" section to the `GeneratorForm`.
- For each stroke type (Free, Back, Breast, Fly, IM, Drill, Kick), provide a segmented control (button group) with labels corresponding to the 1-5 scale.
- Default state: All strokes set to `3` (Occasionally).

### 3. Generation Engine Integration
- Update the workout engine to consume stroke preferences.
- **Logic Rules:**
    - Stroke = `1`: The engine must NOT include this stroke in the generated sets.
    - Stroke = `5`: The engine should prioritize this stroke for the majority of the "Main Set" or high-intensity portions.
    - **Drill Alignment:** If a stroke is preferred (4 or 5) AND "Drill" is enabled (>1), the engine should attempt to select drills relevant to that specific stroke (e.g., "One-arm Fly" if Fly is preferred), provided any required gear is available.
    - **Fallback:** If all strokes are set to `1`, the engine must default to Freestyle (`3`).
    - **Balance:** If multiple strokes are set to `5`, the engine should distribute volume approximately equally among them.

### 4. Persistence
- Ensure stroke preferences are saved in the local state so they persist between sessions (via existing storage/history mechanisms if applicable).

## Non-Functional Requirements
- **Responsiveness:** The UI must remain mobile-friendly, likely using a stack or grid layout for the segmented controls on small screens.
- **Performance:** Stroke filtering and weighting should not noticeably increase generation time.

## Acceptance Criteria
- [ ] User can adjust preferences for all 7 stroke categories in the UI.
- [ ] Generating a workout with a stroke set to "Never" (1) results in a workout with 0% of that stroke.
- [ ] Generating a workout with a stroke set to "Primary Focus" (5) results in that stroke appearing as the dominant stroke type.
- [ ] **Drill Specificity:** If 'Butterfly' is Primary and 'Drill' is enabled, the output includes butterfly-specific drills (if available in the generator logic).
- [ ] Settings persist after a page reload.
- [ ] "Smart Fallback" logic triggers correctly when all strokes are disabled.

## Out of Scope
- Dynamic addition of custom strokes.
- Complex gear dependency rules beyond existing checks (e.g., we won't add "Fins required for this specific drill" logic unless it's already part of the generator's definition).
