import { test, expect } from '@playwright/test';

test('should generate a workout by distance goal', async ({ page }) => {
  await page.goto('/');

  // Toggle to distance goal
  // Use locator to be more specific if needed, but text match usually works
  await page.click('button:has-text("Distance Goal")');

  // Check if distance input is visible
  const distanceInput = page.locator('#distance');
  await expect(distanceInput).toBeVisible();

  // Enter distance
  await page.fill('#distance', '2500');

  // Generate
  // The button text contains "Generate 3 Workouts"
  await page.click('button:has-text("Generate")');

  // Should see workout cards (WorkoutPicker)
  // Each card is a button with "Select This Workout" text
  await expect(page.locator('button:has-text("Select This Workout")').first()).toBeVisible();

  // Pick the first one
  await page.click('button:has-text("Select This Workout") >> nth=0');

  // Check total distance in viewer
  // Viewer shows distance in a bold span
  const distanceText = page.locator('span:text("2500")');
  await expect(distanceText).toBeVisible();
});
