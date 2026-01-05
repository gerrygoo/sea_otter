<script lang="ts">
  import GeneratorForm from '$lib/components/GeneratorForm.svelte';
  import { generateWorkout } from '$lib/engine';
  import { saveWorkout } from '$lib/engine/actions';
  import type { Workout, WorkoutParameters } from '$lib/engine/types';

  let generatedWorkout = $state<Workout | null>(null);

  function handleGenerate(params: WorkoutParameters) {
    generatedWorkout = generateWorkout(params);
  }

  function handleSave() {
    if (generatedWorkout) {
      saveWorkout(generatedWorkout, `Workout ${new Date().toLocaleDateString()}`);
      alert('Workout saved to history!');
    }
  }
</script>

{#if !generatedWorkout}
  <div class="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
    <h1 class="text-3xl font-black uppercase tracking-tight">Generate</h1>
    <GeneratorForm onGenerate={handleGenerate} />
  </div>
{:else}
  <div class="space-y-6">
    <div class="flex justify-between items-center border-b-2 border-black pb-2">
      <h1 class="text-xl font-bold uppercase">Your Set</h1>
      <button onclick={() => generatedWorkout = null} class="text-sm font-bold underline">
        Reset
      </button>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 gap-4 text-center">
      <div class="border-2 border-black p-2">
        <span class="block text-xs uppercase text-gray-500">Distance</span>
        <span class="text-xl font-black">{generatedWorkout.totalDistance}</span>
      </div>
      <div class="border-2 border-black p-2">
        <span class="block text-xs uppercase text-gray-500">Duration</span>
        <span class="text-xl font-black">~{Math.round(generatedWorkout.estimatedDurationMinutes)} min</span>
      </div>
    </div>

    <!-- Segments -->
    {#each ['warmup', 'preset', 'mainSet', 'cooldown'] as segment}
      {#if generatedWorkout[segment as keyof Workout] && generatedWorkout[segment as keyof Workout].length > 0}
        <div class="space-y-2">
          <h2 class="font-black uppercase bg-black text-white px-2 py-1 inline-block">
            {segment.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          <ul class="space-y-3">
            {#each generatedWorkout[segment as keyof Workout] as set}
              <li class="border-l-4 border-black pl-3 py-1">
                <div class="font-bold text-lg leading-tight">
                  {set.reps} x {set.distance} <span class="text-gray-600">@ {set.intervalSeconds ? set.intervalSeconds + 's' : 'rest'}</span>
                </div>
                <div class="text-sm text-gray-800">{set.description}</div>
                {#if set.gearUsed && set.gearUsed.length > 0}
                  <div class="text-xs font-bold text-blue-700 uppercase mt-1">
                    + {set.gearUsed.join(', ')}
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}

    <!-- Actions -->
    <button 
      onclick={handleSave}
      class="w-full bg-blue-600 text-white text-xl font-bold uppercase py-4 hover:bg-blue-700 transition-colors"
    >
      Save Workout
    </button>
  </div>
{/if}
