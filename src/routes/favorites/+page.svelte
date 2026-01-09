<script lang="ts">
  import { favorites, history } from '$lib/stores/history';
  import WorkoutCard from '$lib/components/WorkoutCard.svelte';
  import RenameDialog from '$lib/components/RenameDialog.svelte';
  import { goto } from '$app/navigation';
  import type { SavedWorkout } from '$lib/engine/types';

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    });
  }

  let renamingWorkout = $state<SavedWorkout | null>(null);

  function handleRenameSave(newName: string) {
    if (renamingWorkout) {
      history.rename(renamingWorkout.id, newName);
      renamingWorkout = null;
    }
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
          actions={[
            { 
              label: 'Rename', 
              onClick: () => { renamingWorkout = workout } 
            }
          ]}
        />
      {/each}
    </div>
  {/if}
</div>

{#if renamingWorkout}
  <RenameDialog 
    isOpen={!!renamingWorkout}
    initialName={renamingWorkout.name || formatDate(renamingWorkout.createdAt)}
    onSave={handleRenameSave}
    onCancel={() => renamingWorkout = null}
  />
{/if}