import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render main title', async () => {
		render(Page);
		
		const heading = page.getByRole('heading', { name: /G's Swimming Generator/i });
		await expect.element(heading).toBeInTheDocument();
	});
});