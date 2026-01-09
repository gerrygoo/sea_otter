import { basicIntervalGenerator } from './generators/basic';
import { pyramidGenerator, ladderGenerator } from './generators/patterns';
import { hypoxicGenerator } from './generators/hypoxic';
import { descendingGenerator } from './generators/descending';
import { buildGenerator } from './generators/build';
import { testSetGenerator } from './generators/test_sets';
import { underwaterGenerator } from './generators/specialty';
import { drillGenerator } from './generators/drills';
import { EffortIntensity, getTargetPace, getFocusIntensity, getRestSeconds } from './pace_logic';
import { tagWorkout } from './tagging';
import { mutateWorkout } from './mutation';
import { mixedWarmupGenerator, pyramidWarmupGenerator } from './generators/warmup';
import { protocolWarmupGenerator } from './generators/protocol_warmup';
import { protocolCooldownGenerator } from './generators/protocol_cooldown';
import { Modality, TrainingFocus, StrokeStyle, SetStructure } from './types';
import { isModalityAvailable } from './modality';
import { roundToNearestWall } from './utils';

const WarmupGenerators = [protocolWarmupGenerator, mixedWarmupGenerator, pyramidWarmupGenerator, basicIntervalGenerator];
const MainSetGenerators = [
  pyramidGenerator, 
  ladderGenerator,
  basicIntervalGenerator, 
  descendingGenerator,
  buildGenerator,
  testSetGenerator,
  hypoxicGenerator, 
  underwaterGenerator,
  drillGenerator
];
const CooldownGenerators = [protocolCooldownGenerator, basicIntervalGenerator];

const StandardBlueprint: WorkoutBlueprint = [
  { type: 'warmup', budgetPercentage: 0.20, generators: WarmupGenerators },
  { type: 'mainSet', budgetPercentage: 0.70, generators: MainSetGenerators },
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

  // Handle Distance Target
  let targetDistance = params.targetDistance;
  const isDistanceBased = params.targetType === 'distance' && targetDistance !== undefined;
  
  if (isDistanceBased && targetDistance) {
    targetDistance = roundToNearestWall(targetDistance, params.poolSize);
    if (targetDistance < params.poolSize * 4) targetDistance = params.poolSize * 4;
  }

  const totalTimeSeconds = (params.totalTimeMinutes || 60) * 60;
  const workoutParts: Record<string, SwimSet[]> = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: []
  };

  let remainingTime = totalTimeSeconds;
  let remainingDistance = isDistanceBased ? targetDistance : undefined;

  // 1. Process Main Set First (The anchor of the workout)
  const mainSetSlot = StandardBlueprint.find(s => s.type === 'mainSet')!;
  const mainSetBudget = totalTimeSeconds * mainSetSlot.budgetPercentage;
  const mainSetDistanceBudget = isDistanceBased ? targetDistance! * mainSetSlot.budgetPercentage : undefined;
  
  // Decide on modality for main set based on focus
  let mainSetModality = Modality.Swim;
  
  if (context.focus === TrainingFocus.Strength) {
    if (isModalityAvailable(context, Modality.Pull)) {
      mainSetModality = Modality.Pull;
    } else if (isModalityAvailable(context, Modality.Kick)) {
      mainSetModality = Modality.Kick;
    }
  } else if (context.focus === TrainingFocus.Technique) {
    if (isModalityAvailable(context, Modality.Drill)) {
      mainSetModality = Modality.Drill;
    } else if (isModalityAvailable(context, Modality.Kick)) {
      mainSetModality = Modality.Kick;
    }
  }

  workoutParts.mainSet = fillSlot(mainSetSlot, context, mainSetBudget, randomize, mainSetModality, mainSetDistanceBudget);
  remainingTime -= calculateDuration(workoutParts.mainSet);
  if (isDistanceBased && remainingDistance !== undefined) {
    remainingDistance -= calculateDistance(workoutParts.mainSet);
  }

  // 2. Fill supporting segments (Warmup, Preset, Cooldown)
  const otherSlots = StandardBlueprint.filter(s => s.type !== 'mainSet');
  
  let currentRemainingWeight = otherSlots.reduce((sum, s) => sum + s.budgetPercentage, 0);

  for (const slot of otherSlots) {
    // Dynamic Budgeting: Try to use available slack
    // Calculate proportional share of remaining time
    const proportionalShare = remainingTime * (slot.budgetPercentage / currentRemainingWeight);
    
    // Hard cap to prevent excessive warmups (e.g. max 30% of total time)
    const hardCap = totalTimeSeconds * 0.30;
    
    const slotBudget = Math.min(remainingTime, Math.min(proportionalShare, hardCap));
    
    let slotDistanceBudget: number | undefined;
    if (isDistanceBased && remainingDistance !== undefined) {
         const propDist = remainingDistance * (slot.budgetPercentage / currentRemainingWeight);
         slotDistanceBudget = propDist; 
    }

    workoutParts[slot.type] = fillSlot(slot, context, slotBudget, randomize, undefined, slotDistanceBudget);
    const duration = calculateDuration(workoutParts[slot.type]);
    
    remainingTime -= duration;
    if (isDistanceBased && remainingDistance !== undefined) {
        remainingDistance -= calculateDistance(workoutParts[slot.type]);
    }

    currentRemainingWeight -= slot.budgetPercentage;
  }

  // Enforcement of mandatory segments (>= 40 mins)
  // Only check if we have a time constraint or if it's explicitly time-based
  // If distance-based, we trust the distance generation
  if (params.totalTimeMinutes && params.totalTimeMinutes >= 40) {
    if (workoutParts.warmup.length === 0) {
      workoutParts.warmup.push({
        reps: 1,
        distance: 300,
        stroke: StrokeStyle.Free,
        description: "Warmup: 300 Free Easy (Fallback)",
        intensity: EffortIntensity.Easy,
        intervalSeconds: 300, // Approx 5 mins
        structure: SetStructure.Basic,
        modality: Modality.Swim
      });
    }
    if (workoutParts.cooldown.length === 0) {
      workoutParts.cooldown.push({
        reps: 1,
        distance: 200,
        stroke: StrokeStyle.Free,
        description: "Cooldown: 200 Free Easy (Fallback)",
        intensity: EffortIntensity.Easy,
        intervalSeconds: 240, // Approx 4 mins
        structure: SetStructure.Basic,
        modality: Modality.Swim
      });
    }
  }

  return assembleWorkout(workoutParts, context.poolUnit);
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

/**
 * Generates similar workout variations based on an existing workout.
 * @param workout The base workout to mutate
 * @param params Parameters to respect during mutation (e.g. stroke preferences)
 * @param count Number of variations to return
 */
export const generateSimilar = (workout: Workout, params: WorkoutParameters, count: number = 3): Workout[] => {
  const variations: Workout[] = [];
  for (let i = 0; i < count; i++) {
    variations.push(mutateWorkout(workout, params));
  }
  return variations;
};

// --- Helper Functions ---

function fillSlot(slot: BlueprintSlot, context: GeneratorContext, budget: number, randomize: boolean = false, modality?: Modality, distanceBudget?: number): SwimSet[] {
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
    const sets = generator.generate(context, { timeBudgetSeconds: budget, distanceBudget, modality });
    if (sets) {
      const intensity = slot.type === 'warmup' || slot.type === 'cooldown' 
        ? EffortIntensity.Easy 
        : getFocusIntensity(context.focus);
      
      const targetPace = getTargetPace(context, intensity);

      return sets.map(s => {
        const pace = targetPace ?? 100; // Fallback to 1:40 if no CSS
        const rest = getRestSeconds(context.focus, s.distance, pace);
        const swimTime = (s.distance / 100) * pace;
        
        // Round interval to nearest 5s for realism in swimming
        const interval = Math.ceil((swimTime + rest) / 5) * 5;

        return {
          ...s,
          intensity: intensity,
          targetPacePer100: targetPace ?? undefined,
          restSeconds: rest,
          intervalSeconds: interval
        };
      });
    }
  }

  return [];
}

function calculateDuration(sets: SwimSet[]): number {
  return sets.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
}

function calculateDistance(sets: SwimSet[]): number {
  return sets.reduce((acc, s) => acc + s.distance * s.reps, 0);
}

function assembleWorkout(parts: Record<string, SwimSet[]>, poolUnit: PoolSizeUnit): Workout {
  const allSets = [...parts.warmup, ...parts.preset, ...parts.mainSet, ...parts.cooldown];
  
  const workout: Workout = {
    warmup: parts.warmup,
    preset: parts.preset,
    mainSet: parts.mainSet,
    cooldown: parts.cooldown,
    totalDistance: allSets.reduce((acc, s) => acc + s.distance * s.reps, 0),
    estimatedDurationMinutes: calculateDuration(allSets) / 60,
    tags: [],
    poolUnit
  };

  workout.tags = tagWorkout(workout);

  return workout;
}
