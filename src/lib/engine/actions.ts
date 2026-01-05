import { history } from '../stores/history';
import type { Workout, SavedWorkout } from './types';

/**
 * Converts a generated Workout into a SavedWorkout and adds it to the history.
 */
export const saveWorkout = (workout: Workout, name?: string): SavedWorkout => {
  const savedWorkout: SavedWorkout = {
    ...workout,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isFavorite: false,
    name
  };

  history.add(savedWorkout);
  return savedWorkout;
};
