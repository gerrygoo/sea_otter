# Track Specification: Critical Swim Speed (CSS) Integration & Persistent Settings

## Overview
This track introduces Critical Swim Speed (CSS) as a core parameter in the workout generation engine. CSS defines a swimmer's aerobic capacity and allows the app to generate personalized pace targets. Additionally, this track implements local storage persistence for all generator settings to improve user experience through "sticky" preferences.

## User Stories
- As a swimmer, I want to input my CSS manually or calculate it based on my best times so that the app knows my current fitness level.
- As a swimmer, I want my generator settings (CSS, stroke preferences, etc.) to persist across sessions so that I don't have to re-enter them every time.
- As a swimmer, I want to see specific target times for my workout sets based on my CSS so that I know exactly how fast I should be swimming.
- As a swimmer, I want color coding for these target times to quickly understand the intensity of each set relative to my CSS.

## Functional Requirements

### 1. CSS Parameter Management
- **Input Methods:**
    - Manual entry of CSS pace (time per 100m or 100yd, depending on pool config).
    - Calculator based on 400 and 200 (m or yd) best times.
    - Formula: `CSS = (400m_time - 200m_time) / (400 - 200)`.
- **Persistence:** All CSS settings and all other `GeneratorForm` inputs must be saved to and loaded from `localStorage`.

### 2. Workout Generation Engine Updates
- **Input Extension:** The engine must accept `cssPace` (seconds per 100 units) as an optional parameter.
- **Pace Logic:**
    - **Neutral Effort:** Sets at CSS pace.
    - **Easy Effort (Warmup/Cooldown):** Sets below CSS pace (e.g., CSS + 5-10s per 100).
    - **Hard Effort (Main Sets):** Sets above CSS pace (e.g., CSS - 2-5s per 100).
- **Pace Scaling:** Targets must scale based on the distance of the set (e.g., if CSS is 1:30/100, a 50m target is 45s).

### 3. User Interface Updates
- **Generator Form:**
    - Add a new "Performance (CSS)" section.
    - Implement a toggle between "Manual Entry" and "CSS Calculator".
    - Fields for 400/200 best times in the calculator.
- **Workout Viewer:**
    - Display calculated target times for relevant sets.
    - **Color Coding:**
        - **Below CSS (Easy):** Blue.
        - **At CSS (Neutral):** Green.
        - **Above CSS (Hard):** Red.

## Non-Functional Requirements
- **Validation:** Use Zod to validate CSS inputs and persisted storage data.
- **Responsiveness:** CSS inputs must be mobile-friendly (easy-to-use time pickers or masked inputs).

## Acceptance Criteria
- [ ] Users can successfully calculate CSS within the form.
- [ ] Users can manually override the CSS pace.
- [ ] All form settings persist after a page reload.
- [ ] Generated workouts show calculated target times (e.g., "4x100 @ 1:25").
- [ ] Target times are color-coded correctly based on their intensity relative to CSS.

## Out of Scope
- Direct Garmin/HealthKit integration (future track).
- Multi-user profiles (local storage only).
