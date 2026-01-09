<script lang="ts">
  import { history } from '$lib/stores/history';
  import WorkoutCard from '$lib/components/WorkoutCard.svelte';
  import { goto } from '$app/navigation';

  // Sort by newest first
  let sortedHistory = $derived([...$history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    });
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-black uppercase tracking-tight">History</h1>
    <div class="flex items-center space-x-4">
      <span class="text-sm font-bold text-gray-500">{$history.length} Saved</span>
      {#if $history.length > 0}
        <button 
          onclick={() => { if(confirm('Clear all history?')) history.clear() }}
          class="text-xs text-red-600 font-bold uppercase underline"
        >
          Clear
        </button>
      {/if}
    </div>
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
        <WorkoutCard 
          {workout} 
          title={workout.name || formatDate(workout.createdAt)}
          onClick={() => goto(`/history/${workout.id}`)}
          actionLabel="View Details"
        />
      {/each}
    </div>
  {/if}
</div>
