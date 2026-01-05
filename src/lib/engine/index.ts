import type { WorkoutParameters, Workout, GeneratorContext, WorkoutBlueprint, SwimSet } from './types';
import { basicIntervalGenerator } from './generators/basic';
import { pyramidGenerator, ladderGenerator } from './generators/patterns';
import { hypoxicGenerator } from './generators/hypoxic';
import { pullGenerator, kickGenerator } from './generators/gear';

const WarmupGenerators = [basicIntervalGenerator];
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
  
  const workoutParts: Record<string, SwimSet[]> = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: []
  };

  let remainingTime = totalTimeSeconds;

  // Process Main Set First
  const mainSetSlot = StandardBlueprint.find(s => s.type === 'mainSet')!;
  const mainSetBudget = totalTimeSeconds * mainSetSlot.budgetPercentage;

  // SORT generators by Focus Alignment
  const sortedMainGenerators = [...mainSetSlot.generators].sort((a, b) => {
    const scoreA = a.focusAlignment[context.focus] || 0;
    const scoreB = b.focusAlignment[context.focus] || 0;
    return scoreB - scoreA; // Descending
  });

  let selectedMainSet: SwimSet[] = [];
  for (const generator of sortedMainGenerators) {
    const sets = generator.generate(context, { timeBudgetSeconds: mainSetBudget });
    if (sets) {
      selectedMainSet = sets;
      break;
    }
  }
  
  workoutParts.mainSet = selectedMainSet;
  const mainSetDuration = selectedMainSet.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
  remainingTime -= mainSetDuration;

  const otherSlots = StandardBlueprint.filter(s => s.type !== 'mainSet');
  
  for (const slot of otherSlots) {
    const slotBudget = Math.min(remainingTime, totalTimeSeconds * slot.budgetPercentage);
    
    // Sort other slots too
    const sortedGenerators = [...slot.generators].sort((a, b) => {
        const scoreA = a.focusAlignment[context.focus] || 0;
        const scoreB = b.focusAlignment[context.focus] || 0;
        return scoreB - scoreA;
      });

    let selectedSet: SwimSet[] = [];
    for (const generator of sortedGenerators) {
      const sets = generator.generate(context, { timeBudgetSeconds: slotBudget });
      if (sets) {
        selectedSet = sets;
        break;
      }
    }
    
    workoutParts[slot.type] = selectedSet;
    const duration = selectedSet.reduce((acc, s) => acc + (s.intervalSeconds || 0) * s.reps, 0);
    remainingTime -= duration;
  }

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