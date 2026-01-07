import type { Workout, WorkoutParameters, SwimSet } from './types';
import { StrokeStyle } from './types';
import { getAvailableStrokes, pickStroke } from './utils';
import { tagWorkout } from './tagging';

/**
 * Creates a "neighbor" workout by applying a small random mutation to an existing workout.
 */
export const mutateWorkout = (workout: Workout, params: WorkoutParameters): Workout => {
  // Deep clone to avoid mutating the original
  const mutated = JSON.parse(JSON.stringify(workout)) as Workout;
  
  const strategies = [
    mutateStroke,
    mutateStructure
  ];
  
  // Apply 1-2 mutations
  const numMutations = Math.random() > 0.7 ? 2 : 1;
  let result = mutated;
  for (let i = 0; i < numMutations; i++) {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    result = strategy(result, params);
  }

  // Recalculate distance and tags
  const allSets = [...result.warmup, ...result.preset, ...result.mainSet, ...result.cooldown];
  result.totalDistance = allSets.reduce((acc, s) => acc + s.distance * s.reps, 0);
  result.tags = tagWorkout(result);
  
  return result;
};

function mutateStroke(workout: Workout, params: WorkoutParameters): Workout {
    const parts: (keyof Workout)[] = ['mainSet', 'preset', 'warmup'];
    for (const part of parts) {
        const sets = workout[part] as SwimSet[];
        if (sets && sets.length > 0) {
            const setIdx = Math.floor(Math.random() * sets.length);
            const set = sets[setIdx];
            
            const available = getAvailableStrokes(params.strokePreferences);
            const filtered = available.filter(s => s !== set.stroke);
            
            if (filtered.length > 0) {
                const oldStroke = set.stroke;
                const newStroke = pickStroke(params.strokePreferences, filtered);
                set.stroke = newStroke;
                
                // Update description if it contains the old stroke
                if (typeof set.description === 'string' && typeof oldStroke === 'string') {
                    set.description = set.description.replace(new RegExp(oldStroke, 'gi'), newStroke);
                }
                return workout;
            }
        }
    }
    return workout;
}

function mutateStructure(workout: Workout, params: WorkoutParameters): Workout {
    const sets = workout.mainSet;
    if (!sets || sets.length === 0) return workout;
    
    const setIdx = Math.floor(Math.random() * sets.length);
    const set = sets[setIdx];
    
    // Mutation 1: Split reps (e.g. 1x200 -> 2x100)
    if (set.reps === 1 && set.distance >= 100 && set.distance % 2 === 0) {
        set.reps = 2;
        set.distance = set.distance / 2;
        if (set.intervalSeconds) set.intervalSeconds /= 2;
        
        // Update description "1 x 200" -> "2 x 100"
        set.description = set.description.replace(/1\s*x\s*\d+/, `${set.reps} x ${set.distance}`);
    } 
    // Mutation 2: Merge reps (e.g. 2x100 -> 1x200)
    else if (set.reps === 2) {
        set.reps = 1;
        set.distance *= 2;
        if (set.intervalSeconds) set.intervalSeconds *= 2;
        set.description = set.description.replace(/2\s*x\s*\d+/, `${set.reps} x ${set.distance}`);
    }
    // Mutation 3: Adjust reps (e.g. 4x100 -> 2x200 or 8x50)
    else if (set.reps > 1 && set.reps % 2 === 0) {
        set.reps /= 2;
        set.distance *= 2;
        // interval remains same per rep but distance doubled? 
        // Actually interval per 100 remains same, so intervalSeconds should double.
        if (set.intervalSeconds) set.intervalSeconds *= 2;
        set.description = set.description.replace(new RegExp(`${set.reps * 2}\s*x\s*\d+`), `${set.reps} x ${set.distance}`);
    }
    
    return workout;
}
