/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import GeneratorForm from './GeneratorForm.svelte';
import { StrokeStyle } from '$lib/engine/types';

describe('GeneratorForm', () => {
  it('should render form fields and submit data', async () => {
    const onGenerate = vi.fn();
    render(GeneratorForm, { onGenerate });

    const timeInput = screen.getByLabelText(/Time/i);
    const focusSelect = screen.getByLabelText(/Focus/i);
    const submitButton = screen.getByText(/Generate Workout/i);

    expect(timeInput).toBeTruthy();
    expect(focusSelect).toBeTruthy();
    
    // Simulate user input
    await fireEvent.input(timeInput, { target: { value: '45' } });

    // Change a stroke preference
    const freeOftenButton = screen.getAllByText('Often')[0]; // First 'Often' is for Free
    await fireEvent.click(freeOftenButton);
    
    // Submit
    await fireEvent.click(submitButton);

    expect(onGenerate).toHaveBeenCalled();
    const submittedParams = onGenerate.mock.calls[0][0];
    expect(submittedParams.totalTimeMinutes).toBe(45);
    expect(submittedParams.strokePreferences[StrokeStyle.Free]).toBe(4);
  });
});