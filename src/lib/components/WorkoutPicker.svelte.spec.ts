/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WorkoutPicker from './WorkoutPicker.svelte';
import { StrokeStyle } from '../engine/types';

describe('WorkoutPicker', () => {
  afterEach(() => {
    cleanup();
  });

  const mockWorkouts = [
    {
      warmup: [],
      preset: [],
      mainSet: [{ reps: 4, distance: 100, stroke: StrokeStyle.Free, description: '4 x 100 Free', intervalSeconds: 90 }],
      cooldown: [],
      totalDistance: 400,
      estimatedDurationMinutes: 6,
      tags: ['Endurance', 'Short']
    },
    {
      warmup: [],
      preset: [],
      mainSet: [{ reps: 1, distance: 500, stroke: StrokeStyle.Free, description: '500 Free', intervalSeconds: 450 }],
      cooldown: [],
      totalDistance: 500,
      estimatedDurationMinutes: 7.5,
      tags: ['Distance']
    }
  ];

  it('should render all workout options', () => {
    render(WorkoutPicker, { workouts: mockWorkouts, onSelect: () => {} });
    expect(screen.getByText('400 yds')).toBeTruthy();
    expect(screen.getByText('500 yds')).toBeTruthy();
    expect(screen.getByText('Endurance')).toBeTruthy();
    expect(screen.getByText('Distance')).toBeTruthy();
  });

  it('should call onSelect when a workout is clicked', async () => {
    const onSelect = vi.fn();
    render(WorkoutPicker, { workouts: mockWorkouts, onSelect });

    const firstCard = screen.getByText('400 yds').closest('button');
    await fireEvent.click(firstCard!);

    expect(onSelect).toHaveBeenCalledWith(mockWorkouts[0]);
  });
});