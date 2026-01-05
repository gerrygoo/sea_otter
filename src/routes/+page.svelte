<script lang="ts">
  import GeneratorForm from '$lib/components/GeneratorForm.svelte';
  import WorkoutViewer from '$lib/components/WorkoutViewer.svelte';
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

    <WorkoutViewer workout={generatedWorkout} />

    <!-- Actions -->
    <button 
      onclick={handleSave}
      class="w-full bg-blue-600 text-white text-xl font-bold uppercase py-4 hover:bg-blue-700 transition-colors"
    >
      Save Workout
    </button>
  </div>
{/if}