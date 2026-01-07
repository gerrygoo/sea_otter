import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { settingsStore } from './settings';

describe('Settings Store Persistence (CSS)', () => {
  const STORAGE_KEY = 'sea-otter-settings';

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('window', {
        localStorage: {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; },
        }
    });
    settingsStore.reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should save and load cssPace from localStorage', () => {
    const cssPace = 105; // 1:45

    settingsStore.update(s => ({ ...s, cssPace }));

    // Verify it's in the store
    expect(get(settingsStore).cssPace).toBe(cssPace);

    // Verify it's in localStorage
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.cssPace).toBe(cssPace);
  });

  it('should load cssPace from existing localStorage on init', () => {
     const savedState = {
        poolSize: 25,
        poolUnit: 'meters',
        totalTimeMinutes: 60,
        availableGear: {
            fins: false,
            kickboard: false,
            pullBuoy: false,
            paddles: false,
            snorkel: false
        },
        focus: 'Mixed',
        preferredStrokes: [],
        strokePreferences: {
            Free: 3, Back: 3, Breast: 3, Fly: 3, IM: 3, Drill: 3, Kick: 3, Pull: 3
        },
        effortLevel: 5,
        cssPace: 85 
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    
    // Trigger load
    settingsStore.load();

    expect(get(settingsStore).cssPace).toBe(85);
  });
});
