<script lang="ts">
  import { page } from '$app/state';
  import { history } from '$lib/stores/history';
  import WorkoutViewer from '$lib/components/WorkoutViewer.svelte';
  
  // Get ID from route params
  const id = $derived(page.params.id);
  
  // Find workout
  const workout = $derived($history.find(w => w.id === id));
</script>

<div class="space-y-6">
  <div class="flex items-center space-x-4 border-b-2 border-black pb-4">
    <a href="/history" class="text-sm font-bold underline">← Back</a>
    <h1 class="text-xl font-black uppercase tracking-tight flex-1 text-center">
      {workout?.name || 'Workout Details'}
    </h1>
    <div class="w-10"></div> <!-- Spacer for centering -->
  </div>

  {#if workout}
    <WorkoutViewer {workout} />
    
    <div class="pt-4 border-t-2 border-black/10">
      <p class="text-xs text-center text-gray-500 font-mono">
        ID: {workout.id} <br>
        Created: {new Date(workout.createdAt).toLocaleString()}
      </p>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-lg font-bold text-red-600">Workout not found.</p>
      <a href="/history" class="text-sm underline mt-2 block">Return to History</a>
    </div>
  {/if}
</div>
