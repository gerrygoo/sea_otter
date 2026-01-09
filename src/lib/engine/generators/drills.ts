import type { SetGenerator, SwimSet, Gear } from '../types';
import { StrokeStyle, TrainingFocus, SetStructure, Modality } from '../types';
import { getAvailableStrokes, pickStroke, estimateDistanceDuration } from '../utils';
import { applyModality } from '../modality';

interface TechnicalDrill {
  name: string;
  stroke: StrokeStyle;
  gearRequired?: (keyof Gear)[];
}

const DRILL_LIBRARY: TechnicalDrill[] = [
  // Freestyle
  { name: 'One-arm Freestyle', stroke: StrokeStyle.Free },
  { name: 'Catch-up Drill', stroke: StrokeStyle.Free },
  { name: 'Finger-tip Drag', stroke: StrokeStyle.Free },
  { name: '6-3-6 Drill', stroke: StrokeStyle.Free, gearRequired: ['fins'] },
  
  // Backstroke
  { name: 'One-arm Backstroke', stroke: StrokeStyle.Back },
  { name: 'Double-arm Backstroke', stroke: StrokeStyle.Back },
  { name: 'L-Drill', stroke: StrokeStyle.Back, gearRequired: ['fins'] },
  
  // Breaststroke
  { name: '2 Kicks 1 Pull', stroke: StrokeStyle.Breast },
  { name: 'Breaststroke with Flutter Kick', stroke: StrokeStyle.Breast },
  { name: 'Sculling', stroke: StrokeStyle.Breast, gearRequired: ['paddles'] },
  
  // Butterfly
  { name: 'One-arm Butterfly', stroke: StrokeStyle.Fly },
  { name: 'Butterfly with Breaststroke Kick', stroke: StrokeStyle.Fly },
  { name: 'Body Position Drill', stroke: StrokeStyle.Fly, gearRequired: ['fins', 'snorkel'] },
];

export const drillGenerator: SetGenerator = {
  name: 'Technical Drill Set',
  focusAlignment: {
    [TrainingFocus.Technique]: 1.1, // Prioritize over other technical sets
    [TrainingFocus.Endurance]: 0.4
  },
  generate: (context, constraints) => {
    // Check if Drill is disabled
    if (context.strokePreferences[StrokeStyle.Drill] === 1) {
      return null;
    }

    // Determine which strokes are available and preferred (>= 3)
    const availableStrokes = getAvailableStrokes(context.strokePreferences, [
      StrokeStyle.Free, StrokeStyle.Back, StrokeStyle.Breast, StrokeStyle.Fly
    ]);
    
    // Pick a stroke based on weights
    const targetStroke = pickStroke(context.strokePreferences, availableStrokes);
    
    // Find drills for that stroke that match available gear
    const relevantDrills = DRILL_LIBRARY.filter(d => {
      if (d.stroke !== targetStroke) return false;
      if (!d.gearRequired) return true;
      
      return d.gearRequired.every(gear => context.availableGear[gear]);
    });
    
    if (relevantDrills.length === 0) {
      return null;
    }
    
    // Pick a random drill from the relevant ones
    const drill = relevantDrills[Math.floor(Math.random() * relevantDrills.length)];
    
    const distance = 50;
    const baseInterval = 60; // Drills are slow
    let reps: number;
    if (constraints.distanceBudget) {
      reps = Math.floor(constraints.distanceBudget / distance);
    } else {
      reps = Math.floor(constraints.timeBudgetSeconds / baseInterval);
    }
    
    if (reps < 1) {
      return null;
    }
    
    // Limit reps for drills
    const finalReps = Math.min(reps, 8);

    const set: SwimSet = {
      reps: finalReps,
      distance,
      stroke: targetStroke,
      description: `Drill Set: ${finalReps} x 50 ${targetStroke} (${drill.name})`,
      intervalSeconds: baseInterval,
      gearUsed: drill.gearRequired || [],
      structure: SetStructure.Basic,
      modality: Modality.Drill
    };

    return [applyModality(set, Modality.Drill)];
  }
};
