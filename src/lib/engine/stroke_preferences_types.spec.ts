import { describe, it, expect } from 'vitest';
import { StrokeStyle } from './types';
import type { StrokePreferenceValue } from './types';

describe('Stroke Preferences Types', () => {
  it('should have all required StrokeStyle values', () => {
    // Current ones
    expect(StrokeStyle.Free).toBeDefined();
    expect(StrokeStyle.Back).toBeDefined();
    expect(StrokeStyle.Breast).toBeDefined();
    expect(StrokeStyle.Fly).toBeDefined();
    expect(StrokeStyle.IM).toBeDefined();
    
    // New ones expected by spec
    expect(StrokeStyle.Drill).toBeDefined();
    expect(StrokeStyle.Kick).toBeDefined();
  });

  it('should allow valid preference values (1-5)', () => {
    // This is a type-level check mostly, but we can verify the enum-like behavior if we use a const or similar
    const pref: StrokePreferenceValue = 5;
    expect(pref).toBe(5);
  });
});
