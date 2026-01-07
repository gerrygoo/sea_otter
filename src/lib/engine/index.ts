import type { WorkoutParameters, Workout, GeneratorContext, WorkoutBlueprint, SwimSet, BlueprintSlot } from './types';
import { basicIntervalGenerator } from './generators/basic';
import { pyramidGenerator, ladderGenerator } from './generators/patterns';
import { hypoxicGenerator } from './generators/hypoxic';
import { pullGenerator, kickGenerator } from './generators/gear';
import { underwaterGenerator } from './generators/specialty';

const WarmupGenerators = [basicIntervalGenerator];
const PresetGenerators = [ladderGenerator, kickGenerator, underwaterGenerator];
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
 */
export const generateWorkout = (params: WorkoutParameters): Workout => {
  const context: GeneratorContext = {
    poolSize: params.poolSize,
    poolUnit: params.poolUnit,
    availableGear: params.availableGear,
    focus: params.focus,
    effortLevel: params.effortLevel,
    strokePreferences: params.strokePreferences
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
  
  workoutParts.mainSet = fillSlot(mainSetSlot, context, mainSetBudget);
  remainingTime -= calculateDuration(workoutParts.mainSet);

  // 2. Fill supporting segments (Warmup, Preset, Cooldown)
  const otherSlots = StandardBlueprint.filter(s => s.type !== 'mainSet');
  
  for (const slot of otherSlots) {
    const slotBudget = Math.min(remainingTime, totalTimeSeconds * slot.budgetPercentage);
    workoutParts[slot.type] = fillSlot(slot, context, slotBudget);
    remainingTime -= calculateDuration(workoutParts[slot.type]);
  }

  return assembleWorkout(workoutParts);
};

// --- Helper Functions ---

function fillSlot(slot: BlueprintSlot, context: GeneratorContext, budget: number): SwimSet[] {
  // Sort generators by Focus Alignment
  const sortedGenerators = [...slot.generators].sort((a, b) => {
    const scoreA = a.focusAlignment[context.focus] || 0;
    const scoreB = b.focusAlignment[context.focus] || 0;
    return scoreB - scoreA;
  });

  for (const generator of sortedGenerators) {
    const sets = generator.generate(context, { timeBudgetSeconds: budget });
    if (sets) return sets;
  }

  return [];
}

function calculateDuration(sets: SwimSet[]): number {
  return sets.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
}

function assembleWorkout(parts: Record<string, SwimSet[]>): Workout {
  const allSets = [...parts.warmup, ...parts.preset, ...parts.mainSet, ...parts.cooldown];
  
  return {
    warmup: parts.warmup,
    preset: parts.preset,
    mainSet: parts.mainSet,
    cooldown: parts.cooldown,
    totalDistance: allSets.reduce((acc, s) => acc + s.distance * s.reps, 0),
    estimatedDurationMinutes: calculateDuration(allSets) / 60
  };
}
