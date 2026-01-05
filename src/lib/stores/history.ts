import { writable, derived } from 'svelte/store';
import { storage } from '../utils/storage';
import type { SavedWorkout } from '../engine/types';

function createHistoryStore() {
  const { subscribe, set, update } = writable<SavedWorkout[]>([]);

  return {
    subscribe,
    /**
     * Initializes the store with data from localStorage.
     */
    init() {
      const data = storage.getAll();
      set(data);
    },
    /**
     * Adds a new workout to the history and persists it.
     */
    add(workout: SavedWorkout) {
      update((all) => {
        const updated = [workout, ...all];
        storage.save(workout);
        return updated;
      });
    },
    /**
     * Updates an existing workout (e.g., toggling favorite status).
     */
    update(workout: SavedWorkout) {
      update((all) => {
        const index = all.findIndex((w) => w.id === workout.id);
        if (index === -1) return all;
        
        const updated = [...all];
        updated[index] = workout;
        storage.save(workout);
        return updated;
      });
    },
    /**
     * Removes a workout from history and storage.
     */
    remove(id: string) {
      update((all) => {
        const updated = all.filter((w) => w.id !== id);
        storage.delete(id);
        return updated;
      });
    },
    /**
     * Clears all history.
     */
    clear() {
      storage.clear();
      set([]);
    }
  };
}

export const history = createHistoryStore();

/**
 * A derived store that only contains favorite workouts.
 */
export const favorites = derived(history, ($history) => 
  $history.filter((w) => w.isFavorite)
);
