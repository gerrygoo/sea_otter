# Swimming Workout Generator: Logic & Parameters

This document serves as the source of truth for the workout generation engine. It defines the training focuses, the mathematical relationship between Critical Swim Speed (CSS) and intensity, and the rules for constructing sets.

## 1. Core Logic: The CSS Pacing Model

The engine calculates target times based on the user's **Critical Swim Speed (CSS)**. All intensities are defined as a deviation from CSS.

* **CSS Definition:** The pace a swimmer can maintain for a 1500m time trial (Threshold).
* **Time Unit:** Seconds per 100m.

### Intensity Zones Table

The engine should map "Easy", "Hard", etc., to specific mathematical zones.

| Zone ID | Name | Relation to CSS (per 100m) | Description | Engine Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Z1** | **Recovery** | `CSS + 15s` (or slower) | Active recovery, warm-up, cool-down. | `easy` |
| **Z2** | **Endurance** | `CSS + 4s` to `CSS + 8s` | Aerobic base building. Sustainable for long distances. | `moderate-easy` |
| **Z3** | **Threshold** | `CSS` to `CSS + 2s` | The "Red Line". Hard but sustainable for ~20-30 mins. | `normal` (The Anchor) |
| **Z4** | **VO2 Max** | `CSS - 2s` to `CSS - 4s` | Anaerobic threshold. Painful, sustainable for 200m-400m. | `hard` |
| **Z5** | **Sprint** | `CSS - 6s` (or faster) | Pure speed and power. Short bursts only. | `max-effort` |

---

## 2. Training Focus Categories

The engine selects one "Primary Focus" per workout. This determines the Main Set structure and the dominant Intensity Zone.

### A. Endurance (Aerobic Capacity)
* **Goal:** Improve cardiovascular efficiency and ability to hold a steady pace.
* **Primary Zones:** Z2 (Endurance) & Z3 (Threshold).
* **Rest Logic:** Short rest (10s - 20s). High work-to-rest ratio (e.g., 6:1).
* **Set Structure:** Long continuous swims or high-rep intervals.
* *Example:* `3 x 800m @ Z2 with 30s rest.`

### B. Speed (Anaerobic Power)
* **Goal:** Recruit fast-twitch fibers and improve lactate tolerance.
* **Primary Zones:** Z5 (Sprint) & Z1 (Recovery).
* **Rest Logic:** Long rest (1:2 to 1:4 work-to-rest ratio).
* **Set Structure:** Short distance, high intensity, full recovery.
* *Example:* `8 x 50m @ Z5 with 2:00 active recovery.`

### C. Strength (Power Endurance)
* **Goal:** Increase distance per stroke and muscular force.
* **Primary Zones:** Z3 (Threshold) & Z4 (VO2 Max).
* **Equipment Trigger:** High probability of **Paddles** and **Pull Buoy**.
* **Rest Logic:** Moderate rest (20s - 30s).
* **Set Structure:** Middle distance (100m - 400m) with added resistance.
* *Example:* `10 x 100m Pull/Paddles @ Z3 with 20s rest.`

### D. Technique (Efficiency)
* **Goal:** Neuromuscular patterning and stroke correction.
* **Primary Zones:** Z1 (Recovery) & Z2 (Endurance).
* **Rest Logic:** Variable. Enough to reset mental focus (usually 20s-30s).
* **Set Structure:** Drills, short distances, "Perfect Stroke" counting.
* *Example:* `12 x 50m (25 Drill / 25 Swim) @ Z1.`

### E. Threshold (The "Red Mist")
* **Goal:** Raise the CSS ceiling.
* **Primary Zones:** Z3 (Threshold) strictly.
* **Rest Logic:** Very strict short rest (10s - 15s).
* **Set Structure:** The "Classic CSS" sets.
* *Example:* `20 x 100m @ CSS with 10s rest.`

### F. Mixed (IM / Medley)
* **Goal:** Overall athleticism and stroke versatility.
* **Primary Zones:** Variable (Z2 through Z5).
* **Set Structure:** Changes in stroke (Fly, Back, Breast, Free) and intensity within the set.
* *Example:* `4 x 200m IM (Individual Medley) descending 1-4.`

---

## 3. Workout Construction Logic

The engine should assemble a workout using these three blocks:

### Block 1: Warm-Up (15-20% of total distance)
* **Focus:** Z1 (Recovery).
* **Content:** Swim, Kick, and minimal Pull.
* *Default:* 300m - 500m mixed easy swimming.

### Block 2: Main Set (60-70% of total distance)
* **Logic:** Determined by **Training Focus** (see Section 2).
* **Parameters:**
    * **Distance:** The "meat" of the workout.
    * **Intervals:** Calculated as `Target Pace + Rest`.
    * **Reps:** Total Distance / Rep Distance.

### Block 3: Cool Down (10-15% of total distance)
* **Focus:** Z1 (Recovery).
* **Content:** Easy freestyle or double-arm backstroke.
* *Default:* 100m - 300m easy.

---

## 4. Variable Modifiers

The engine should calculate "Difficulty Score" (Load) based on **Volume × Intensity**:

1.  **CSS (Threshold):** High Volume + Short Rest = **HARD**.
2.  **Sprint (Z5):** Low Volume + Long Rest = **HARD**.
3.  **Endurance (Z2):** High Volume + Short Rest = **NORMAL**.

---

## 5. Equipment Flags

The engine can tag sets with required equipment based on focus:

* `fins`: Used for **Speed** (overspeed training) or **Technique** (body position).
* `paddles`: Used for **Strength**.
* `pull_buoy`: Used for **Strength** or **Endurance** (to save legs).
* `snorkel`: Used for **Technique** (remove breathing rotation) or **Endurance** (hypoxic training).
* `kickboard`: Used for **Leg Strength** sets.
