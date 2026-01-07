/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { writable } from 'svelte/store';

// Mock settingsStore
vi.mock('$lib/stores/settings', () => {
  const store = writable({
    totalTimeMinutes: 60,
    poolSize: 25,
    poolUnit: 'meters',
    availableGear: { fins: false, kickboard: false, pullBuoy: false, paddles: false, snorkel: false },
    focus: 'Mixed',
    preferredStrokes: [],
    strokePreferences: {
      'Free': 3, 'Back': 3, 'Breast': 3, 'Fly': 3, 'IM': 3, 'Drill': 3, 'Kick': 3, 'Pull': 3
    },
    effortLevel: 5,
    cssPace: undefined
  });
  return {
    settingsStore: {
      subscribe: store.subscribe,
      set: vi.fn((val) => store.set(val)),
      load: vi.fn(),
    }
  };
});

import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import GeneratorForm from './GeneratorForm.svelte';
import { StrokeStyle } from '$lib/engine/types';
import { afterEach } from 'vitest';

describe('GeneratorForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render form fields and submit data', async () => {
    const onGenerate = vi.fn();
    const { getByLabelText, getByText, getAllByText } = render(GeneratorForm, { onGenerate });

    const timeInput = getByLabelText(/Time/i);
    const focusSelect = getByLabelText(/Focus/i);
    const submitButton = getByText(/Generate Workout/i);

    expect(timeInput).toBeTruthy();
    expect(focusSelect).toBeTruthy();
    
    // Simulate user input
    await fireEvent.input(timeInput, { target: { value: '45' } });

    // Change a stroke preference
    const freeOftenButton = getAllByText('Often')[0]; // First 'Often' is for Free
    await fireEvent.click(freeOftenButton);
    
    // Submit
    await fireEvent.click(submitButton);

    expect(onGenerate).toHaveBeenCalled();
    const submittedParams = onGenerate.mock.calls[0][0];
    expect(submittedParams.totalTimeMinutes).toBe(45);
    expect(submittedParams.strokePreferences[StrokeStyle.Free]).toBe(4);
  });

  it('should allow manual CSS entry', async () => {
    const onGenerate = vi.fn();
    const { getByPlaceholderText, getByText } = render(GeneratorForm, { onGenerate });

    const minInput = getByPlaceholderText('MM');
    const secInput = getByPlaceholderText('SS');
    
    await fireEvent.input(minInput, { target: { value: '1' } });
    await fireEvent.input(secInput, { target: { value: '30' } });

    const submitButton = getByText(/Generate Workout/i);
    await fireEvent.click(submitButton);

    expect(onGenerate).toHaveBeenCalled();
    const submittedParams = onGenerate.mock.calls[0][0];
    expect(submittedParams.cssPace).toBe(90);
  });

  it('should calculate CSS using the calculator', async () => {
    const onGenerate = vi.fn();
    const { getByRole, getAllByPlaceholderText, getByText, getByPlaceholderText } = render(GeneratorForm, { onGenerate });

    // Switch to Calc mode
    const calcToggle = getByRole('button', { name: 'Calc' });
    await fireEvent.click(calcToggle);

    const inputs = getAllByPlaceholderText('MM');
    // In calc mode, manual MM is removed, so we only have 400m and 200m
    const calc400Min = inputs[0];
    const calc200Min = inputs[1];

    const secInputs = getAllByPlaceholderText('SS');
    const calc400Sec = secInputs[0];
    const calc200Sec = secInputs[1];

    // 400m: 6:00 (360s)
    // 200m: 2:50 (170s)
    // Expected: 95s
    await fireEvent.input(calc400Min, { target: { value: '6' } });
    await fireEvent.input(calc400Sec, { target: { value: '0' } });
    await fireEvent.input(calc200Min, { target: { value: '2' } });
    await fireEvent.input(calc200Sec, { target: { value: '50' } });

    const calcButton = getByText('Calculate CSS');
    await fireEvent.click(calcButton);

    // Should switch back to manual and show result
    expect(getAllByPlaceholderText('MM')[0]).toHaveValue(1);
    expect(getAllByPlaceholderText('SS')[0]).toHaveValue(35);

    const submitButton = getByText(/Generate Workout/i);
    await fireEvent.click(submitButton);

    expect(onGenerate).toHaveBeenCalled();
    const submittedParams = onGenerate.mock.calls[0][0];
    expect(submittedParams.cssPace).toBe(95);
  });
});