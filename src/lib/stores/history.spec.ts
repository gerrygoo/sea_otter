import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { history, favorites } from './history';

describe('History Store', () => {
  const mockWorkout = {
    warmup: [],
    preset: [],
    mainSet: [],
    cooldown: [],
    totalDistance: 1000,
    estimatedDurationMinutes: 30,
    id: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: new Date().toISOString(),
    isFavorite: false
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
    vi.stubGlobal('window', { localStorage: localStorageMock });
    vi.stubGlobal('localStorage', localStorageMock);
    history.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should initialize with empty array', () => {
    history.init();
    expect(get(history)).toEqual([]);
  });

  it('should add a workout and persist it', () => {
    history.add(mockWorkout);
    expect(get(history)).toHaveLength(1);
    expect(get(history)[0].id).toBe(mockWorkout.id);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update a workout and synchronize favorites derived store', () => {
    history.add(mockWorkout);
    expect(get(favorites)).toHaveLength(0);

    const updated = { ...mockWorkout, isFavorite: true };
    history.update(updated);

    expect(get(history)[0].isFavorite).toBe(true);
    expect(get(favorites)).toHaveLength(1);
    expect(get(favorites)[0].id).toBe(mockWorkout.id);
  });

  it('should remove a workout', () => {
    history.add(mockWorkout);
    history.remove(mockWorkout.id);
    expect(get(history)).toHaveLength(0);
  });

  it('should load data from storage on init', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([mockWorkout]));
    history.init();
    expect(get(history)).toHaveLength(1);
    expect(get(history)[0].id).toBe(mockWorkout.id);
  });
});
