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
    <p class="text-gray-600 mt-2">I've generated {workouts.length} variations for you.</p>
  </div>

  <div class="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
    {#each workouts as workout, i}
      <button 
        onclick={() => onSelect(workout)}
        class="text-left border-4 border-black bg-white hover:bg-yellow-50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group relative"
      >
        <!-- Header -->
        <div class="bg-black text-white p-4 flex justify-between items-center">
            <h3 class="font-bold text-xl uppercase">Option {i + 1}</h3>
            <div class="flex gap-2 text-xs font-bold text-black">
                <span class="bg-white px-2 py-1">{workout.totalDistance} yds</span>
                <span class="bg-white px-2 py-1">~{Math.round(workout.estimatedDurationMinutes)} min</span>
            </div>
        </div>
        
        <!-- Content -->
        <div class="p-6 space-y-4">
             <!-- Tags -->
             <div class="flex flex-wrap gap-2">
                {#each workout.tags || [] as tag}
                  <span class="text-xs font-bold uppercase px-2 py-1 border-2 border-black bg-gray-100">
                    {tag}
                  </span>
                {/each}
             </div>

             <!-- Main Set Preview (Expanded) -->
             <div>
                <h4 class="font-bold uppercase text-sm border-b-2 border-black mb-2 pb-1">Main Set</h4>
                <ul class="space-y-2 text-sm">
                    {#each workout.mainSet as set}
                        <li class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                             <span class="font-mono font-bold mr-2 whitespace-nowrap">{set.reps} x {set.distance} {set.stroke}</span>
                             <!-- Clean up description to avoid redundancy if possible, or just show it -->
                             <span class="text-gray-600 text-xs text-left sm:text-right flex-1 leading-tight">{set.description}</span>
                        </li>
                    {/each}
                </ul>
             </div>

             <!-- Other Parts Summary -->
             <div class="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-2 border-t-2 border-black/10">
                <div>Warmup: {workout.warmup.reduce((acc,s)=>acc+s.distance*s.reps,0)}y</div>
                <div>Preset: {workout.preset.reduce((acc,s)=>acc+s.distance*s.reps,0)}y</div>
                <div>Cooldown: {workout.cooldown.reduce((acc,s)=>acc+s.distance*s.reps,0)}y</div>
             </div>
        </div>

        <!-- CTA -->
        <div class="bg-gray-100 p-3 text-center font-bold uppercase text-sm border-t-4 border-black group-hover:bg-black group-hover:text-white transition-colors">
            Select This Workout
        </div>
      </button>
    {/each}
  </div>
</div>