import type { Workout } from './types';

export const tagWorkout = (workout: Workout): string[] => {
  const tags: Set<string> = new Set();
  
  // Analyze Main Set for primary characteristics
  for (const set of workout.mainSet) {
    const desc = set.description.toLowerCase();
    
    if (desc.includes('basic aerobic')) tags.add('Endurance');
    if (desc.includes('pyramid')) tags.add('Mixed');
    if (desc.includes('ladder')) tags.add('Mixed');
    if (desc.includes('sprint') || desc.includes('fast')) tags.add('Speed');
    if (desc.includes('hypoxic')) tags.add('Hypoxic');
    if (desc.includes('drill')) tags.add('Technique');
    if (desc.includes('kick')) tags.add('Legs');
    if (desc.includes('pull')) tags.add('Arms');
  }

  // Fallback if no tags found from descriptions (shouldn't happen often)
  if (tags.size === 0) {
      tags.add('Balanced');
  }
  
  if (workout.totalDistance > 3000) tags.add('Long');
  else if (workout.totalDistance < 1500) tags.add('Short');
  
  return Array.from(tags);
};
