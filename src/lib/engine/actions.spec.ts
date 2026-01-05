/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { saveWorkout } from './actions';
import { history } from '../stores/history';

describe('Engine Actions', () => {
  const mockWorkout = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: [],
    totalDistance: 1000,
    estimatedDurationMinutes: 30
  };

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    history.clear();
  });

  it('should convert and save a workout to history', () => {
    const saved = saveWorkout(mockWorkout, 'Test Workout');
    
    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Test Workout');
    expect(get(history)).toHaveLength(1);
    expect(get(history)[0].id).toBe(saved.id);
  });
});
