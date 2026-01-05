<script lang="ts">
  import { history } from '$lib/stores/history';
  import WorkoutCard from '$lib/components/WorkoutCard.svelte';

  // Sort by newest first
  let sortedHistory = $derived($history.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-black uppercase tracking-tight">History</h1>
    <span class="text-sm font-bold text-gray-500">{$history.length} Saved</span>
  </div>

  {#if $history.length === 0}
    <div class="w-full border-2 border-black p-8 border-dashed text-center text-gray-500">
      No workouts saved yet.
      <br>
      <a href="/" class="text-blue-600 underline font-bold">Generate one!</a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each sortedHistory as workout (workout.id)}
        <WorkoutCard {workout} />
      {/each}
    </div>
  {/if}
</div>