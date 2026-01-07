<script lang="ts">
  import GeneratorForm from '$lib/components/GeneratorForm.svelte';
  import WorkoutViewer from '$lib/components/WorkoutViewer.svelte';
  import WorkoutPicker from '$lib/components/WorkoutPicker.svelte';
  import { generateWorkoutOptions, generateSimilar } from '$lib/engine';
  import { saveWorkout } from '$lib/engine/actions';
  import type { Workout, WorkoutParameters } from '$lib/engine/types';

  let workoutOptions = $state<Workout[]>([]);
  let selectedWorkout = $state<Workout | null>(null);
  let currentParams = $state<WorkoutParameters | null>(null);

  function handleGenerate(params: WorkoutParameters) {
    currentParams = params;
    workoutOptions = generateWorkoutOptions(params, params.optionCount || 3);
    selectedWorkout = null;
  }

  function handleSelect(workout: Workout) {
    selectedWorkout = workout;
  }

  function handleFindSimilar() {
    if (selectedWorkout && currentParams) {
      workoutOptions = generateSimilar(selectedWorkout, currentParams, currentParams.optionCount || 3);
      selectedWorkout = null;
    }
  }

  function handleRegenerate() {
    if (currentParams) {
      workoutOptions = generateWorkoutOptions(currentParams, currentParams.optionCount || 3);
      selectedWorkout = null;
    }
  }

  function handleSave() {
    if (selectedWorkout) {
      saveWorkout(selectedWorkout, `Workout ${new Date().toLocaleDateString()}`);
      alert('Workout saved to history!');
    }
  }

  function reset() {
    workoutOptions = [];
    selectedWorkout = null;
    currentParams = null;
  }
</script>

{#if workoutOptions.length === 0}
  <div class="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
    <h1 class="text-3xl font-black uppercase tracking-tight text-center">Swimming Generator</h1>
    <GeneratorForm onGenerate={handleGenerate} />
  </div>
{:else if !selectedWorkout}
  <div class="space-y-6">
    <div class="flex justify-between items-center border-b-2 border-black pb-2">
      <h1 class="text-xl font-bold uppercase">Results</h1>
      <div class="space-x-4">
        <button onclick={handleRegenerate} class="text-sm font-bold underline">
          Try Again
        </button>
        <button onclick={reset} class="text-sm font-bold underline">
          Back to form
        </button>
      </div>
    </div>
    <WorkoutPicker workouts={workoutOptions} onSelect={handleSelect} />
  </div>
{:else}
  <div class="space-y-6">
    <div class="flex justify-between items-center border-b-2 border-black pb-2">
      <h1 class="text-xl font-bold uppercase">Your Set</h1>
      <div class="space-x-4">
        <button onclick={() => selectedWorkout = null} class="text-sm font-bold underline">
          Change Option
        </button>
        <button onclick={reset} class="text-sm font-bold underline">
          Reset
        </button>
      </div>
    </div>

    <WorkoutViewer workout={selectedWorkout} />

    <!-- Actions -->
    <div class="space-y-3 pt-4">
      <button 
        onclick={handleSave}
        class="w-full bg-blue-600 text-white text-xl font-bold uppercase py-4 hover:bg-blue-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
      >
        Save Workout
      </button>
      
      <button 
        onclick={handleFindSimilar}
        class="w-full bg-yellow-400 text-black text-lg font-bold uppercase py-3 hover:bg-yellow-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
      >
        Find Similar Variations
      </button>
    </div>
  </div>
{/if}