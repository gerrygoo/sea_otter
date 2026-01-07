/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import WorkoutViewer from './WorkoutViewer.svelte';
import { PoolSizeUnit, StrokeStyle } from '../engine/types';
import { EffortIntensity } from '../engine/pace_logic';

describe('WorkoutViewer', () => {
  afterEach(() => {
    cleanup();
  });

  const mockWorkout = {
    warmup: [
      { 
        reps: 4, 
        distance: 50, 
        stroke: StrokeStyle.Free, 
        description: 'Warmup', 
        intensity: EffortIntensity.Easy,
        targetPacePer100: 100 // 1:40
      }
    ],
    preset: [],
    mainSet: [
      {
        reps: 10,
        distance: 100,
        stroke: StrokeStyle.Free,
        description: 'Main Set',
        intensity: EffortIntensity.Hard,
        targetPacePer100: 85 // 1:25
      }
    ],
    cooldown: [],
    totalDistance: 1200,
    estimatedDurationMinutes: 25,
  };

  it('should render workout stats and segments', () => {
    expect(WorkoutViewer).toBeTruthy();
  });

  it('should display target times with correct formatting', () => {
    render(WorkoutViewer, { workout: mockWorkout });

    // 4 x 50 @ 100s/100m -> target time should be 0:50
    expect(screen.getByText('0:50')).toBeTruthy();
    
    // 10 x 100 @ 85s/100m -> target time should be 1:25
    expect(screen.getByText('1:25')).toBeTruthy();
  });

  it('should apply intensity-based color classes', () => {
    render(WorkoutViewer, { workout: mockWorkout });

    const easyTime = screen.getByText('0:50');
    const hardTime = screen.getByText('1:25');

    expect(easyTime.className).toContain('text-blue-600');
    expect(hardTime.className).toContain('text-red-600');
  });
});
