import type { WorkoutParameters, Workout, GeneratorContext, WorkoutBlueprint, SwimSet, BlueprintSlot } from './types';
import { basicIntervalGenerator } from './generators/basic';
import { pyramidGenerator, ladderGenerator } from './generators/patterns';
import { hypoxicGenerator } from './generators/hypoxic';
import { pullGenerator, kickGenerator } from './generators/gear';
import { underwaterGenerator } from './generators/specialty';
import { drillGenerator } from './generators/drills';
import { EffortIntensity, getTargetPace } from './pace_logic';
import { tagWorkout } from './tagging';

const WarmupGenerators = [basicIntervalGenerator];
const PresetGenerators = [ladderGenerator, kickGenerator, underwaterGenerator, drillGenerator];
const MainSetGenerators = [pyramidGenerator, basicIntervalGenerator, hypoxicGenerator, pullGenerator];
const CooldownGenerators = [basicIntervalGenerator];

const StandardBlueprint: WorkoutBlueprint = [
  { type: 'warmup', budgetPercentage: 0.15, generators: WarmupGenerators },
  { type: 'preset', budgetPercentage: 0.15, generators: PresetGenerators },
  { type: 'mainSet', budgetPercentage: 0.60, generators: MainSetGenerators },
  { type: 'cooldown', budgetPercentage: 0.10, generators: CooldownGenerators }
];

/**
 * Orchestrates the generation of a structured swimming workout based on user parameters.
 * Uses a "Bucket & Filler" heuristic prioritized by training focus.
 * @param params User parameters
 * @param randomize If true, shuffles top-ranked generators to create variety
 */
export const generateWorkout = (params: WorkoutParameters, randomize: boolean = false): Workout => {
  const context: GeneratorContext = {
    poolSize: params.poolSize,
    poolUnit: params.poolUnit,
    availableGear: params.availableGear,
    focus: params.focus,
    effortLevel: params.effortLevel,
    strokePreferences: params.strokePreferences,
    cssPace: params.cssPace
  };

  const totalTimeSeconds = params.totalTimeMinutes * 60;
  const workoutParts: Record<string, SwimSet[]> = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: []
  };

  let remainingTime = totalTimeSeconds;

  // 1. Process Main Set First (The anchor of the workout)
  const mainSetSlot = StandardBlueprint.find(s => s.type === 'mainSet')!;
  const mainSetBudget = totalTimeSeconds * mainSetSlot.budgetPercentage;
  
  workoutParts.mainSet = fillSlot(mainSetSlot, context, mainSetBudget, randomize);
  remainingTime -= calculateDuration(workoutParts.mainSet);

  // 2. Fill supporting segments (Warmup, Preset, Cooldown)
  const otherSlots = StandardBlueprint.filter(s => s.type !== 'mainSet');
  
  for (const slot of otherSlots) {
    const slotBudget = Math.min(remainingTime, totalTimeSeconds * slot.budgetPercentage);
    workoutParts[slot.type] = fillSlot(slot, context, slotBudget, randomize);
    remainingTime -= calculateDuration(workoutParts[slot.type]);
  }

  return assembleWorkout(workoutParts);
};

/**
 * Generates multiple distinct workout options for the given parameters.
 * @param params User parameters
 * @param count Number of options to generate
 */
export const generateWorkoutOptions = (params: WorkoutParameters, count: number = 3): Workout[] => {
  const workouts: Workout[] = [];
  // For options, we always want variety, so we enable randomization
  for (let i = 0; i < count; i++) {
    workouts.push(generateWorkout(params, true));
  }
  return workouts;
};

// --- Helper Functions ---

function fillSlot(slot: BlueprintSlot, context: GeneratorContext, budget: number, randomize: boolean = false): SwimSet[] {
  // Sort generators by Focus Alignment
  let sortedGenerators = [...slot.generators].sort((a, b) => {
    const scoreA = a.focusAlignment[context.focus] || 0;
    const scoreB = b.focusAlignment[context.focus] || 0;
    return scoreB - scoreA;
  });

  if (randomize) {
    // Shuffle the top 3 generators to introduce variety while keeping quality
    // This allows us to rotate between equally valid strategies (e.g. Pyramid vs Basic vs Hypoxic)
    const topCount = Math.min(3, sortedGenerators.length);
    const topGenerators = sortedGenerators.slice(0, topCount);
    const restGenerators = sortedGenerators.slice(topCount);
    
    // Fisher-Yates shuffle for top candidates
    for (let i = topGenerators.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topGenerators[i], topGenerators[j]] = [topGenerators[j], topGenerators[i]];
    }
    
    sortedGenerators = [...topGenerators, ...restGenerators];
  }

  for (const generator of sortedGenerators) {
    const sets = generator.generate(context, { timeBudgetSeconds: budget });
    if (sets) {
      const intensity = slot.type === 'warmup' || slot.type === 'cooldown' 
        ? EffortIntensity.Easy 
        : slot.type === 'mainSet' 
          ? EffortIntensity.Hard 
          : EffortIntensity.Neutral;
      
      const targetPace = getTargetPace(context, intensity);

      return sets.map(s => ({
        ...s,
        intensity: intensity,
        targetPacePer100: targetPace ?? undefined
      }));
    }
  }

  return [];
}

function calculateDuration(sets: SwimSet[]): number {
  return sets.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
}

function assembleWorkout(parts: Record<string, SwimSet[]>): Workout {
  const allSets = [...parts.warmup, ...parts.preset, ...parts.mainSet, ...parts.cooldown];
  
  const workout: Workout = {
    warmup: parts.warmup,
    preset: parts.preset,
    mainSet: parts.mainSet,
    cooldown: parts.cooldown,
    totalDistance: allSets.reduce((acc, s) => acc + s.distance * s.reps, 0),
    estimatedDurationMinutes: calculateDuration(allSets) / 60,
    tags: []
  };

  workout.tags = tagWorkout(workout);

  return workout;
}