import { SavedWorkoutSchema } from '../engine/schema';
import type { SavedWorkout } from '../engine/types';

const STORAGE_KEY = 'sea-otter-workouts';

export const storage = {
  /**
   * Retrieves all saved workouts from localStorage.
   */
  getAll(): SavedWorkout[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Validate each workout and filter out invalid ones
      return parsed
        .map((item) => {
          const result = SavedWorkoutSchema.safeParse(item);
          if (result.success) return result.data;
          console.error('Invalid workout in storage:', result.error);
          return null;
        })
        .filter((item): item is SavedWorkout => item !== null);
    } catch (e) {
      console.error('Failed to parse storage data:', e);
      return [];
    }
  },

  /**
   * Saves a single workout to storage.
   */
  save(workout: SavedWorkout): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const all = this.getAll();
    const index = all.findIndex((w) => w.id === workout.id);

    if (index >= 0) {
      all[index] = workout;
    } else {
      all.unshift(workout); // Add new ones to the top
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  /**
   * Deletes a workout by ID.
   */
  delete(id: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const all = this.getAll().filter((w) => w.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  /**
   * Clears all saved workouts.
   */
  clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
};