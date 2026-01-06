import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { settingsStore } from './settings';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '$lib/engine/types';

describe('Settings Store', () => {
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
    settingsStore.reset();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with default values', () => {
    const value = get(settingsStore);
    expect(value.totalTimeMinutes).toBe(30);
    expect(value.poolUnit).toBe(PoolSizeUnit.Meters);
    expect(value.strokePreferences[StrokeStyle.Free]).toBe(3);
  });

  it('should persist changes to localStorage', () => {
    settingsStore.update(s => ({ ...s, totalTimeMinutes: 45 }));
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sea-otter-settings', expect.stringContaining('"totalTimeMinutes":45'));
  });

  it('should load from localStorage on initialization', () => {
    const savedSettings = {
      poolSize: 25,
      poolUnit: PoolSizeUnit.Yards,
      totalTimeMinutes: 50,
      availableGear: { fins: true, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
      focus: TrainingFocus.Aerobic,
      preferredStrokes: [],
      strokePreferences: {
        [StrokeStyle.Free]: 5,
        [StrokeStyle.Back]: 3,
        [StrokeStyle.Breast]: 3,
        [StrokeStyle.Fly]: 3,
        [StrokeStyle.IM]: 3,
        [StrokeStyle.Drill]: 3,
        [StrokeStyle.Kick]: 3,
        [StrokeStyle.Pull]: 3,
      },
      effortLevel: 5
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));
    
    settingsStore.load();
    
    const value = get(settingsStore);
    expect(value.totalTimeMinutes).toBe(50);
    expect(value.strokePreferences[StrokeStyle.Free]).toBe(5);
  });
});
