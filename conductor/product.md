# Initial Concept
I want to build an app (ideally a web app) called **"G's Swimming Generator"** that helps me generate lap swimming workouts. I want the main focus to be a feature-rich engine that can capture many parameters such as available drill gear and training goals. The ouput should be a collection of reasonable workouts given the parameters. I've more ideas to add around/on top of this but that's the core.

# Target Audience
*   **Primary User:** Former competitive swimmers (specifically yourself) who now swim for fitness and personal enjoyment.
*   **Needs:**
    *   Structured training that pushes physical limits.
    *   Creative variety to avoid the monotony of lap swimming.
    *   Integration with existing fitness tracking (Garmin watch).

# Core Goals
1.  **Progressive Conditioning:** Generate workouts that help the user steadily improve physical fitness and swimming performance.
2.  **Creative Variety:** Provide unique and varied workout structures to maintain engagement and prevent boredom.
3.  **Extensibility:** Build a workout generation engine that is flexible and easily expandable to accommodate new parameters in the future.

# Key Features
*   **Advanced Workout Generation Engine:**
    *   **Generic/Extensible Interface:** Design the engine to accept a wide array of input parameters, allowing for easy addition of new variables.
    *   **Input Parameters:**
        *   **Pool Configuration:** Pool size (yards/meters).
        *   **Constraints:** Total available time OR target distance.
        *   **Performance:** Critical Swim Speed (CSS) integration for personalized pace targets.
        *   **Stroke Preferences:** Granular control (1-5 scale) for each stroke type (Free, Back, Breast, Fly, IM).
        *   **Technique Focus:** Explicit preference settings for Drill, Kick, and Pull sets.
        *   **Focus Areas:** Skill prioritization (Aerobic, Speed, Strength, Technique).
        *   **Equipment:** Available tools (paddles, fins, pull buoy, snorkel, kickboard, etc.).
    *   **User Interface:**
    *   **Mobile-First Design:** A responsive web interface optimized for readability and quick reference at the pool deck. Includes a **Workout Selection** flow for comparing multiple generated options.
    *   **Space Traversal:** Explore "adjacent" workouts by requesting variations similar to a selected set.
    *   **History & Favorites:** Save workouts locally to track progress and bookmark favorite sessions.
    *   **Workout Detail View:** Review full details of any past workout from your history.
    *   **Offline Support:** Progressive Web App (PWA) capabilities for reliable use in pool environments with poor connectivity.
    *   **Serialization:** Support for exporting workouts to standard formats (e.g., JSON) with future potential for direct Garmin integration.
# Workout Generation Logic (CSS & Pacing)

## 1. Core Logic: The CSS Pacing Model
The engine calculates target times based on the user's **Critical Swim Speed (CSS)**. All intensities are defined as a deviation from CSS.

* **CSS Definition:** The pace a swimmer can maintain for a 1500m time trial (Threshold).
* **Time Unit:** Seconds per 100m.

### Intensity Zones Table
| Zone ID | Name | Relation to CSS (per 100m) | Description | Engine Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Z1** | **Recovery** | `CSS + 15s` (or slower) | Active recovery, warm-up, cool-down. | `easy` |
| **Z2** | **Endurance** | `CSS + 4s` to `CSS + 8s` | Aerobic base building. | `moderate-easy` |
| **Z3** | **Threshold** | `CSS` to `CSS + 2s` | The "Red Line". Hard but sustainable. | `normal` |
| **Z4** | **VO2 Max** | `CSS - 2s` to `CSS - 4s` | Anaerobic threshold. | `hard` |
| **Z5** | **Sprint** | `CSS - 6s` (or faster) | Pure speed and power. | `max-effort` |

## 2. Training Focus Categories
The engine selects one "Primary Focus" per workout.
* **Endurance:** Aerobic capacity. Z2/Z3 focus. Short rest.
* **Speed:** Anaerobic power. Z5/Z1 focus. Long rest.
* **Strength:** Power endurance. Z3/Z4 focus. Paddles/Pull Buoy emphasis.
* **Technique:** Efficiency. Z1/Z2 focus. Drills emphasis.
* **Threshold:** Raising the CSS ceiling. Z3 focus strictly.
* **Mixed:** IM/Medley versatility. Variable zones.

## 3. Pacing Structures (Exercise Types)
* **Basic:** Steady state (constant pace).
* **Descending:** Each repetition gets faster than the previous one (`Target Time_N = Target Time_(N-1) - Decrement`).
* **Build:** Acceleration *within* a single repetition (Start Z1 -> Finish Z5).
* **Test:** Max-effort time trial (e.g., 400m) to update CSS data. `isTest: true`.
* **Pyramid:** Distance increases then decreases.
* **Ladder:** Distance increases sequentially.

## 4. Architectural Separation: Structure vs. Modality
To allow for complex combinations (e.g., "Descending Pull Set"), the engine separates:
1. **Structure (The Shape):** Basic, Pyramid, Ladder, Descending, Build, Test.
2. **Modality (The Constraint):** Swim, Pull, Kick, Drill, Hypoxic, Underwater.
3. **Stroke (The Style):** Free, Back, Breast, Fly, IM.

## 5. Workout Construction Blocks
* **Warm-Up:** 15-20% of distance. Structured in 3 phases: Loosening (Z1), Activation (Kick/Drill), and Priming (Build/Speed). Mandatory for workouts ≥ 40 mins.
* **Main Set:** 60-70% of distance. Driven by Primary Focus and Structure/Modality mix.
* **Cool Down:** 10-15% of distance. Z1 focus. Volume scales with Main Set intensity. Mandatory for workouts ≥ 40 mins.
