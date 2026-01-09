/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WorkoutPicker from './WorkoutPicker.svelte';
import { StrokeStyle, PoolSizeUnit } from '../engine/types';

describe('WorkoutPicker', () => {
  afterEach(() => {
    cleanup();
  });

  const mockWorkouts = [
    {
      warmup: [],
      mainSet: [{ reps: 4, distance: 100, stroke: StrokeStyle.Free, description: '4 x 100 Free', intervalSeconds: 90 }],
      cooldown: [],
      totalDistance: 400,
      estimatedDurationMinutes: 6,
      tags: ['Endurance', 'Short'],
      poolUnit: PoolSizeUnit.Yards
    },
    {
      warmup: [],
      mainSet: [{ reps: 1, distance: 500, stroke: StrokeStyle.Free, description: '500 Free', intervalSeconds: 450 }],
      cooldown: [],
      totalDistance: 500,
      estimatedDurationMinutes: 7.5,
      tags: ['Distance'],
      poolUnit: PoolSizeUnit.Yards
    }
  ];

  it('should render all workout options', () => {
    render(WorkoutPicker, { workouts: mockWorkouts, onSelect: () => {} });
    expect(screen.getAllByText('400 yds').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('500 yds').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Endurance')).toBeTruthy();
    expect(screen.getByText('Distance')).toBeTruthy();
  });

  it('should call onSelect when a workout is clicked', async () => {
    const onSelect = vi.fn();
    render(WorkoutPicker, { workouts: mockWorkouts, onSelect });

    const firstOption = screen.getByText('Option 1');
    await fireEvent.click(firstOption);

    expect(onSelect).toHaveBeenCalledWith(mockWorkouts[0]);
  });
});