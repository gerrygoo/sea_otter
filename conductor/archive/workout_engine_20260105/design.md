# Design: Workout Generation Engine

## 1. Problem Definition
The "Workout Generation Problem" (WGP) is a combinatorial optimization problem where the goal is to select an ordered sequence of "Swim Sets" that satisfy user constraints while maximizing fitness function objectives (training focus, variety, flow).

### 1.1 Inputs (Constraints & Parameters)
*   **$T_{target}$**: Target Total Duration (minutes).
*   **$G_{user}$**: Set of available gear (e.g., {Fins, Paddles, Snorkel}).
*   **$P_{pool}$**: Pool Length (e.g., 25y).
*   **$F_{focus}$**: Training Focus (e.g., "Endurance", "Sprint").
*   **$S_{history}$**: (Optional) Recent workout history to avoid repetition.

### 1.2 The "Knapsack" Analogy
At its core, this resembles a **Knapsack Problem** (filling a container of fixed capacity $T_{target}$ with items of varying cost $t_{set}$ and value $v_{set}$), but with added structural constraints:
1.  **Ordering:** A workout has a rigid structure (Warmup $\to$ Preset $\to$ Main $\to$ Cool).
2.  **Dependencies:** A Main Set might require a specific Warmup type.
3.  **Flow:** Intensity should follow a curve (e.g., ramp up, peak, cool down).

## 2. Mathematical Model

### 2.1 Variables
Let $W$ be a workout consisting of a sequence of slots $S_1, S_2, ..., S_n$.
Each slot $S_i$ is filled by a "Set Template" $T$ instantiated with parameters $p$.

### 2.2 Hard Constraints
1.  **Time Constraint:**
    $$ | \sum_{i=1}^{n} duration(S_i) - T_{target} | \le \epsilon $$
    (The total duration must be within a tolerance $\epsilon$ of the target).

2.  **Gear Constraint:**
    $$ \forall S_i \in W, gear(S_i) \subseteq G_{user} $$
    (Every set must only use available gear).

3.  **Structure Constraint:**
    $$ type(S_1) = \text{Warmup} $$
    $$ type(S_n) = \text{Cooldown} $$
    $$ \exists S_i : type(S_i) = \text{MainSet} $$

### 2.3 Objective Function (Soft Constraints)
Maximize $Score(W)$:
$$ Score(W) = w_1 \cdot FocusMatch(W, F_{focus}) + w_2 \cdot Variety(W, S_{history}) + w_3 \cdot Flow(W) $$

## 3. Algorithmic Candidates

### Option A: Pure Constraint Programming (CSP) / Linear Programming (LP)
*   **Concept:** Use a solver (like `YALPS` or `cassowary`) to mathematically solve for the optimal combination of sets.
*   **Pros:** Mathematically rigorous, guarantees "optimal" solutions based on the cost function.
*   **Cons:** "Swim Sets" are discrete, complex objects, not simple numbers. Modeling the *flow* and *feeling* of a workout as linear equations is difficult. Overkill complexity for the initial dataset size.

### Option B: Template-Based "Constructive Heuristic" (Recommended)
*   **Concept:** A custom algorithm that fills the workout "buckets" (Warmup, Preset, Main, Cooldown) sequentially using weighted random selection.
*   **Algorithm:**
    1.  **Reserve Time:** Allocate fixed % of $T_{target}$ for Warmup (15%) and Cooldown (10%).
    2.  **Solve Main Set:** The remaining time is the "Main Set Budget". Search the "Main Set Library" for templates that fit this budget (scaling reps/distance if necessary).
    3.  **Fill Gaps:** Select Warmup and Preset that strictly fit the reserved time and align with the chosen Main Set's focus.
    4.  **Backtrack:** If no valid Main Set is found, adjust the budget distribution and retry.
*   **Pros:** Easier to reason about, easier to debug ("Why did it pick this?"), and models the way a human coach thinks (Main Set first, then wrap around it).
*   **Cons:** Not mathematically "optimal", but "good enough" for creative generation.

### Option C: Genetic Algorithms
*   **Concept:** Generate 100 random workouts, "breed" the best ones, mutate (swap sets), and evolve towards the target.
*   **Pros:** Can come up with truly unexpected, creative combinations.
*   **Cons:** Computationally expensive (running in browser), hard to tune mutation rates, non-deterministic (hard to test).

## 4. Proposed Architecture: The "Bucket & Filler" Engine

We will proceed with **Option B (Constructive Heuristic)** but formalized with strong types to avoid "spaghetti code".

### 4.1 The "Set Generator" Interface
Instead of static JSON data, we define `SetGenerators`. A `SetGenerator` is a function that takes a `TimeBudget` and returns a valid `SwimSet` (or `null`).

```typescript
type SetGenerator = (
  constraints: { 
    timeBudget: number, 
    gear: Gear, 
    pool: Pool 
  }
) => SwimSet | null;
```

### 4.2 The "Blueprint"
A `WorkoutBlueprint` defines the structure.
```typescript
const StandardBlueprint = [
  { type: 'Warmup', budgetPct: 0.15, generator: WarmupGenerators },
  { type: 'Preset', budgetPct: 0.15, generator: SkillGenerators },
  { type: 'MainSet', budgetPct: 0.60, generator: MainSetGenerators },
  { type: 'Cooldown', budgetPct: 0.10, generator: CooldownGenerators }
];
```

### 4.3 Execution Flow
1.  **Budgeting:** Calculate time buckets based on Blueprint percentages.
2.  **Selection (Main Set First):**
    *   It is critical to pick the **Main Set** first, as it dictates the character of the workout.
    *   Find a `MainSetGenerator` that can satisfy the `MainSetBudget` (with +/- tolerance).
    *   If the Main Set "under-fills" the bucket, the remaining time flows to the Preset/Warmup buckets.
3.  **Back-Filling:**
    *   Select Warmup/Preset/Cooldown to fit the remaining finalized time slots.
4.  **Assembly:** Concatenate and return.

## 5. Next Steps
1.  **Refine Types:** Update `types.ts` to support this Generator/Blueprint model.
2.  **Implement Generators:** Create the "Logic Units" for standard sets (e.g., "Pyramid Set", "Interval Set").
3.  **Build Orchestrator:** The function that runs the Blueprint.

```