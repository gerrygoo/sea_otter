<script lang="ts">
  import type { Workout } from '$lib/engine/types';

  let { workouts, onSelect } = $props<{ 
    workouts: Workout[], 
    onSelect: (workout: Workout) => void 
  }>();
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold uppercase border-b-4 border-black inline-block pb-1">Choose your workout</h2>
    <p class="text-gray-600 mt-2">I've generated a few variations for you. Which one feels right?</p>
  </div>

  <div class="flex overflow-x-auto pb-4 gap-4 snap-x md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0">
    {#each workouts as workout}
      <button 
        onclick={() => onSelect(workout)}
        class="flex-shrink-0 w-[85vw] md:w-auto snap-center text-left border-4 border-black p-4 bg-white hover:bg-yellow-50 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex flex-wrap gap-1">
            {#each workout.tags || [] as tag}
              <span class="text-[10px] font-bold uppercase px-1 border border-black group-hover:bg-black group-hover:text-white transition-colors">
                {tag}
              </span>
            {/each}
          </div>
          <div class="font-mono text-sm font-bold">
            {workout.totalDistance} yards
          </div>
        </div>

        <div class="font-bold text-lg mb-1">
          ~{Math.round(workout.estimatedDurationMinutes)} min
        </div>

        <div class="border-t-2 border-black/10 pt-2 text-sm">
          <span class="block text-gray-500 text-[10px] font-bold uppercase mb-1">Main Set Preview</span>
          <div class="text-xs line-clamp-3 italic">
            {#if workout.mainSet.length > 0}
              {workout.mainSet[0].reps}x{workout.mainSet[0].distance} {workout.mainSet[0].stroke}
              {#if workout.mainSet.length > 1}
                + {workout.mainSet.length - 1} more segments
              {/if}
            {:else}
              No main set generated.
            {/if}
          </div>
        </div>

        <div class="mt-4 text-xs font-bold uppercase text-right group-hover:underline">
          Select Workout →
        </div>
      </button>
    {/each}
  </div>
</div>
