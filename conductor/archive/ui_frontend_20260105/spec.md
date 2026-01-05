# Specification: Mobile-First User Interface

## Overview
This track implements the frontend for Sea Otter. It translates the core engine and persistence logic into a clean, minimalist, and highly legible mobile web application.

## User Stories
*   As a swimmer, I want a clean, high-contrast interface that I can read easily at the pool.
*   As a swimmer, I want to easily input my gear and training goals via a simple form.
*   As a swimmer, I want to see my generated workout in standard swimming shorthand.
*   As a swimmer, I want to toggle between a summary view and a detailed view of each set.
*   As a swimmer, I want to access my workout history and favorites through a dedicated tab.

## Functional Requirements
*   **Navigation:** A simple bottom-bar or tab-based navigation (Generate, History, Settings/About).
*   **Generator Form:** Reactive form using Svelte to capture all parameters (Pool size, Time, Gear, Focus).
*   **Workout View:**
    *   Display workout segments (Warm-up, Preset, Main, Cool-down).
    *   Standard shorthand display (e.g., 4x100 @ 1:30).
    *   Expandable/Navigatable detailed view for drills and hypoxic sets.
*   **History/Favorites Screen:** Lists saved workouts with date, total distance, and favorite status.
*   **Responsiveness:** Fully optimized for mobile devices (portrait orientation).

## Design Principles (from product-guidelines.md)
*   **Aesthetic:** Clean and Minimalist.
*   **Legibility:** High contrast, large touch targets (at least 44x44px).
*   **Directness:** No unnecessary animations or distractions.

## Technical Constraints
*   **Framework:** SvelteKit (SPA mode for GitHub Pages).
*   **Styling:** Tailwind CSS.
*   **Icons:** Lucide-Svelte (or similar lightweight icon set).

## Acceptance Criteria
*   The application is fully functional on mobile browsers.
*   Users can generate, save, and view workouts without errors.
*   The UI matches the "Clean and Minimalist" guidelines.
*   The history list accurately reflects saved data from `localStorage`.
