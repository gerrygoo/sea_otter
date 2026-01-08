# Track Specification: Workout Duration Optimization

## Overview
Users are reporting that generated workouts often fall significantly short of the requested duration (e.g., 30-40 mins for a 60 min request). This is primarily due to:
1.  **Under-scaling Generators:** Generators like `pyramidGenerator` use fixed-size patterns that don't scale up to fill larger time budgets.
2.  **Rigid Budgeting:** The engine's slotting system (Warmup, Preset, Main, Cooldown) might leave "slack" time unused if the Main Set doesn't fill its quota.

This track aims to make the fit "tighter" around the input time parameter.

## Functional Requirements

### 1. Generator Enhancements
- **Dynamic Scaling:** Generators must be able to produce larger sets when budget allows.
    - **Pyramid:** Add "Giant Pyramid" (up to 400 or 500) and "Double Pyramid" logic.
    - **Ladder:** Add "Long Ladder" (up to 500 or higher).
    - **Basic:** Ensure rep counts maximize the budget (already mostly true, but check).
- **Repeat Logic:** If a generator's pattern is too short, it should consider repeating the pattern (e.g., 2x Pyramid) if it fits.

### 2. Engine Budgeting Logic
- **Slack Reallocation:** If the Main Set leaves time on the table, it should be re-distributed to supporting slots (Warmup/Cooldown) or used to trigger a secondary Main Set (though usually scaling the Main Set is better).
- **Minimum Duration Check:** The engine should aim for at least 85% of the requested time.

## User Stories
- As a swimmer who has 60 minutes, I want a workout that takes ~55-60 minutes, not 35.
- As a swimmer, I want harder/longer main sets when I have more time.

## Acceptance Criteria
- [ ] `pyramidGenerator` produces larger/longer sets for 60+ min workouts.
- [ ] `ladderGenerator` scales up for longer workouts.
- [ ] Generated workouts for 60 mins consistently fall in the 50-60 min range.
- [ ] "Slack" time is minimized.
