<script lang="ts">
  import { favorites } from '$lib/stores/history';
  import WorkoutCard from '$lib/components/WorkoutCard.svelte';
  import { goto } from '$app/navigation';

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    });
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-black uppercase tracking-tight">Favorites</h1>
    <span class="text-sm font-bold text-gray-500">{$favorites.length} Starred</span>
  </div>

  {#if $favorites.length === 0}
    <div class="w-full border-2 border-black p-8 border-dashed text-center text-gray-500">
      No favorites yet.
      <br>
      Star a workout in your history to see it here.
    </div>
  {:else}
    <div class="space-y-4">
      {#each $favorites as workout (workout.id)}
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
