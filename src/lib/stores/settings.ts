import { writable } from 'svelte/store';
import { PoolSizeUnit, TrainingFocus, StrokeStyle, type WorkoutParameters } from '../engine/types';
import { WorkoutParametersSchema } from '../engine/schema';

const STORAGE_KEY = 'sea-otter-settings';

const DEFAULT_SETTINGS: WorkoutParameters = {
  poolSize: 25,
  poolUnit: PoolSizeUnit.Meters,
  targetType: 'time',
  targetDistance: 2000,
  totalTimeMinutes: 60,
  availableGear: {
    fins: false,
    kickboard: false,
    pullBuoy: false,
    paddles: false,
    snorkel: false
  },
  focus: TrainingFocus.Mixed,
  preferredStrokes: [],
  strokePreferences: {
    [StrokeStyle.Free]: 3,
    [StrokeStyle.Back]: 3,
    [StrokeStyle.Breast]: 3,
    [StrokeStyle.Fly]: 3,
    [StrokeStyle.IM]: 3,
    [StrokeStyle.Drill]: 3,
    [StrokeStyle.Kick]: 3,
    [StrokeStyle.Pull]: 3
  },
  effortLevel: 5
};

function createSettingsStore() {
  const { subscribe, set, update } = writable<WorkoutParameters>(DEFAULT_SETTINGS);

  function load() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const result = WorkoutParametersSchema.safeParse(parsed);
      if (result.success) {
        set(result.data);
      } else {
        console.error('Invalid settings in storage:', result.error);
      }
    } catch (e) {
      console.error('Failed to parse settings data:', e);
    }
  }

  // Initial load
  load();

  return {
    subscribe,
    set: (value: WorkoutParameters) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
      set(value);
    },
    update: (fn: (value: WorkoutParameters) => WorkoutParameters) => {
      update((current) => {
        const next = fn(current);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    reset: () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      set(DEFAULT_SETTINGS);
    },
    load
  };
}

export const settingsStore = createSettingsStore();
