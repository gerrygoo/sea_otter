import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';

describe('Storage Utility', () => {
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

  // Manual mock for localStorage
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
    storage.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should save and retrieve a workout', () => {
    storage.save(mockWorkout);
    const all = storage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(mockWorkout.id);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should handle updating an existing workout', () => {
    storage.save(mockWorkout);
    const updated = { ...mockWorkout, isFavorite: true };
    storage.save(updated);
    
    const all = storage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].isFavorite).toBe(true);
  });

  it('should delete a workout', () => {
    storage.save(mockWorkout);
    storage.delete(mockWorkout.id);
    const all = storage.getAll();
    expect(all).toHaveLength(0);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled(); // Because we use setItem with filtered list
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // 1 save, 1 delete (overwrite)
  });

  it('should ignore invalid data in localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([{ invalid: 'data' }]));
    const all = storage.getAll();
    expect(all).toHaveLength(0);
  });

  it('should return empty array if localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    const all = storage.getAll();
    expect(all).toHaveLength(0);
  });
});