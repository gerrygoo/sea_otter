import type { WorkoutParameters, Workout, GeneratorContext, WorkoutBlueprint, SwimSet } from './types';
import { basicIntervalGenerator } from './generators/basic';
import { pyramidGenerator, ladderGenerator } from './generators/patterns';
import { hypoxicGenerator } from './generators/hypoxic';
import { pullGenerator, kickGenerator } from './generators/gear';
import { estimateDistanceDuration } from './utils';

// Define standard generators for each slot
// TODO: In future tasks, we will expand these lists
const WarmupGenerators = [basicIntervalGenerator]; // Just use basic for now
const PresetGenerators = [ladderGenerator, kickGenerator];
const MainSetGenerators = [pyramidGenerator, basicIntervalGenerator, hypoxicGenerator, pullGenerator];
const CooldownGenerators = [basicIntervalGenerator];

const StandardBlueprint: WorkoutBlueprint = [
  { type: 'warmup', budgetPercentage: 0.15, generators: WarmupGenerators },
  { type: 'preset', budgetPercentage: 0.15, generators: PresetGenerators },
  { type: 'mainSet', budgetPercentage: 0.60, generators: MainSetGenerators },
  { type: 'cooldown', budgetPercentage: 0.10, generators: CooldownGenerators }
];

export const generateWorkout = (params: WorkoutParameters): Workout => {
  const context: GeneratorContext = {
    poolSize: params.poolSize,
    poolUnit: params.poolUnit,
    availableGear: params.availableGear,
    focus: params.focus,
    effortLevel: params.effortLevel
  };

  const totalTimeSeconds = params.totalTimeMinutes * 60;
  
  // Initialize workout buckets
  const workoutParts: Record<string, SwimSet[]> = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: []
  };

  let remainingTime = totalTimeSeconds;

  // 1. Process Main Set First (Priority)
  // We look for the main set slot in the blueprint
  const mainSetSlot = StandardBlueprint.find(s => s.type === 'mainSet')!;
  const mainSetBudget = totalTimeSeconds * mainSetSlot.budgetPercentage;

  // Try to generate main set
  let selectedMainSet: SwimSet[] = [];
  for (const generator of mainSetSlot.generators) {
    const sets = generator(context, { timeBudgetSeconds: mainSetBudget });
    if (sets) {
      selectedMainSet = sets;
      break; // Found one!
    }
  }
  
  workoutParts.mainSet = selectedMainSet;
  const mainSetDuration = selectedMainSet.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
  remainingTime -= mainSetDuration;

  // 2. Fill the rest based on remaining time and ratios
  // Re-normalize remaining budget? Or just split strictly?
  // Strategy: Fill Warmup and Cooldown with fixed minimal needs, then Preset gets the rest?
  // For MVP, let's just stick to the blueprint ratios applied to the *original* total, but capped by remaining.

  const otherSlots = StandardBlueprint.filter(s => s.type !== 'mainSet');
  
  for (const slot of otherSlots) {
    const slotBudget = Math.min(remainingTime, totalTimeSeconds * slot.budgetPercentage);
    
    // Attempt generation
    let selectedSet: SwimSet[] = [];
    for (const generator of slot.generators) {
      const sets = generator(context, { timeBudgetSeconds: slotBudget });
      if (sets) {
        selectedSet = sets;
        break;
      }
    }
    
    workoutParts[slot.type] = selectedSet;
    const duration = selectedSet.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
    remainingTime -= duration;
  }

  // Calculate totals
  const allSets = [
    ...workoutParts.warmup, 
    ...workoutParts.preset, 
    ...workoutParts.mainSet, 
    ...workoutParts.cooldown
  ];

  const totalDistance = allSets.reduce((acc, s) => acc + s.distance * s.reps, 0);
  const totalDuration = allSets.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);

  return {
    warmup: workoutParts.warmup,
    preset: workoutParts.preset,
    mainSet: workoutParts.mainSet,
    cooldown: workoutParts.cooldown,
    totalDistance,
    estimatedDurationMinutes: totalDuration / 60
  };
};
