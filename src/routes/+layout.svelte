<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import { onMount } from 'svelte';
	import { history } from '$lib/stores/history';

	let { children } = $props();

	onMount(() => {
		history.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="p-4 pb-20 max-w-md mx-auto w-full">
	{@render children()}
</main>

<Navigation />
