/**
 * @vitest-environment happy-dom
 */
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import StrokePreferenceSelector from './StrokePreferenceSelector.svelte';
import { StrokeStyle } from '$lib/engine/types';

describe('StrokePreferenceSelector', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render all preference levels', () => {
    const { getByText, getAllByText } = render(StrokePreferenceSelector, { 
      stroke: StrokeStyle.Free,
      value: 3,
      handleChange: () => {}
    });

    expect(getByText('Never')).toBeDefined();
    expect(getByText('Rarely')).toBeDefined();
    expect(getByText('Occasionally')).toBeDefined();
    expect(getAllByText('Often')).toHaveLength(2);
    expect(getByText('Primary')).toBeDefined();
  });

  it('should call handleChange when a level is clicked', async () => {
    const handleChange = vi.fn();
    const { getAllByText } = render(StrokePreferenceSelector, { 
      stroke: StrokeStyle.Free,
      value: 3,
      handleChange
    });

    await fireEvent.click(getAllByText('Often')[0]);
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
