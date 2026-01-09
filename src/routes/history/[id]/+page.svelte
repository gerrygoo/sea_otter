<script lang="ts">
  import { page } from '$app/state';
  import { history } from '$lib/stores/history';
  import { settingsStore } from '$lib/stores/settings';
  import { generationStore } from '$lib/stores/generation';
  import { generateSimilar } from '$lib/engine';
  import WorkoutViewer from '$lib/components/WorkoutViewer.svelte';
  import { goto } from '$app/navigation';
  
  // Get ID from route params
  const id = $derived(page.params.id);
  
  // Find workout
  const workout = $derived($history.find(w => w.id === id));

  function toggleFavorite() {
    if (workout) {
      history.update({ ...workout, isFavorite: !workout.isFavorite });
    }
  }

  function handleGenerateSimilar() {
    if (workout) {
      const newOptions = generateSimilar(workout, $settingsStore, 3);
      generationStore.set(newOptions);
      goto('/');
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center space-x-4 border-b-2 border-black pb-4">
    <a href="/history" class="text-sm font-bold underline">← Back</a>
    <h1 class="text-xl font-black uppercase tracking-tight flex-1 text-center truncate px-2">
      {workout?.name || 'Workout Details'}
    </h1>
    
    {#if workout}
      <button 
        onclick={toggleFavorite} 
        class="text-2xl leading-none hover:scale-110 transition-transform"
        aria-label={workout.isFavorite ? "Unfavorite" : "Favorite"}
      >
        {workout.isFavorite ? '★' : '☆'}
      </button>
    {:else}
      <div class="w-6"></div>
    {/if}
  </div>

  {#if workout}
    <WorkoutViewer {workout} />
    
    <div class="pt-4 space-y-4">
      <button 
        onclick={handleGenerateSimilar}
        class="w-full bg-yellow-400 text-black text-lg font-bold uppercase py-3 hover:bg-yellow-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
      >
        Find Similar Variations
      </button>

      <div class="border-t-2 border-black/10 pt-4">
        <p class="text-xs text-center text-gray-500 font-mono">
          ID: {workout.id} <br>
          Created: {new Date(workout.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-lg font-bold text-red-600">Workout not found.</p>
      <a href="/history" class="text-sm underline mt-2 block">Return to History</a>
    </div>
  {/if}
</div>
