<script lang="ts">
  import type { Workout } from '$lib/engine/types';
  import WorkoutCard from './WorkoutCard.svelte';

  let { workouts, onSelect } = $props<{ 
    workouts: Workout[], 
    onSelect: (workout: Workout) => void 
  }>();
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold uppercase border-b-4 border-black inline-block pb-1">Choose your workout</h2>
    <p class="text-gray-600 mt-2">I've generated {workouts.length} variations for you.</p>
  </div>

  <div class="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
    {#each workouts as workout, i}
      <WorkoutCard 
        {workout}
        title={`Option ${i + 1}`}
        onClick={() => onSelect(workout)}
      />
    {/each}
  </div>
</div>