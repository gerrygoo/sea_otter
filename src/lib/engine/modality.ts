import { Modality, type SwimSet, type GeneratorContext, StrokeStyle } from './types';

/**
 * Checks if a modality is available based on gear and preferences.
 */
export function isModalityAvailable(context: GeneratorContext, modality: Modality): boolean {
  switch (modality) {
    case Modality.Pull:
      return !!(context.availableGear.pullBuoy && context.availableGear.paddles && context.strokePreferences[StrokeStyle.Pull] > 1);
    case Modality.Kick:
      return !!(context.availableGear.kickboard && context.strokePreferences[StrokeStyle.Kick] > 1);
    case Modality.Drill:
      return !!(context.strokePreferences[StrokeStyle.Drill] > 1);
    default:
      return true;
  }
}

/**
 * Applies modality-specific constraints and metadata to a SwimSet.
 */
export function applyModality(set: SwimSet, modality: Modality): SwimSet {
  const updated = { ...set, modality };
  
  // Ensure gearUsed is initialized
  if (!updated.gearUsed) {
    updated.gearUsed = [];
  }

  switch (modality) {
    case Modality.Pull:
      if (!updated.gearUsed.includes('pullBuoy')) updated.gearUsed.push('pullBuoy');
      if (!updated.gearUsed.includes('paddles')) updated.gearUsed.push('paddles');
      if (!updated.description.includes('(Pull)')) {
        updated.description = `${updated.description} (Pull)`;
      }
      break;
    case Modality.Kick:
      if (!updated.gearUsed.includes('kickboard')) updated.gearUsed.push('kickboard');
      if (!updated.description.includes('(Kick)')) {
        updated.description = `${updated.description} (Kick)`;
      }
      break;
    case Modality.Drill:
      if (!updated.description.includes('(Drill)')) {
        updated.description = `${updated.description} (Drill)`;
      }
      break;
    case Modality.Hypoxic:
      if (!updated.description.includes('(Hypoxic)')) {
        updated.description = `${updated.description} (Hypoxic)`;
      }
      break;
    case Modality.Underwater:
      if (!updated.description.includes('(Underwater)')) {
        updated.description = `${updated.description} (Underwater)`;
      }
      break;
  }
  
  return updated;
}
