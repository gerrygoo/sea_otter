<script lang="ts">
  import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '$lib/engine/types';
  import type { WorkoutParameters, StrokePreferenceValue } from '$lib/engine/types';
  import StrokePreferenceSelector from './StrokePreferenceSelector.svelte';

  let { onGenerate } = $props<{ onGenerate: (params: WorkoutParameters) => void }>();

  let params = $state<WorkoutParameters>({
    poolSize: 25,
    poolUnit: PoolSizeUnit.Yards,
    totalTimeMinutes: 30,
    availableGear: {
      fins: false,
      kickboard: false,
      pullBuoy: false,
      paddles: false,
      snorkel: false
    },
    focus: TrainingFocus.Aerobic,
    preferredStrokes: [],
    strokePreferences: {
      [StrokeStyle.Free]: 3,
      [StrokeStyle.Back]: 3,
      [StrokeStyle.Breast]: 3,
      [StrokeStyle.Fly]: 3,
      [StrokeStyle.IM]: 3,
      [StrokeStyle.Drill]: 3,
      [StrokeStyle.Kick]: 3
    },
    effortLevel: 5
  });

  const focusOptions = Object.values(TrainingFocus);
  const strokeOptions = Object.values(StrokeStyle).filter(s => s !== StrokeStyle.Choice);
  const gearOptions = [
    { key: 'fins', label: 'Fins' },
    { key: 'kickboard', label: 'Kickboard' },
    { key: 'pullBuoy', label: 'Pull Buoy' },
    { key: 'paddles', label: 'Paddles' },
    { key: 'snorkel', label: 'Snorkel' }
  ];

  function handlePreferenceChange(stroke: StrokeStyle, val: StrokePreferenceValue) {
    params.strokePreferences[stroke] = val;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    onGenerate($state.snapshot(params));
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full max-w-md mx-auto pb-12">
  <!-- Time & Pool -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="time" class="block text-sm font-bold uppercase mb-1">Time (mins)</label>
      <input 
        type="number" 
        id="time" 
        bind:value={params.totalTimeMinutes} 
        min="10" 
        max="120"
        class="w-full border-2 border-black p-2 rounded-none focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
      />
    </div>
    <div>
      <label for="poolSize" class="block text-sm font-bold uppercase mb-1">Pool Size</label>
      <div class="flex">
        <input 
          type="number" 
          id="poolSize" 
          bind:value={params.poolSize}
          class="w-16 border-2 border-black p-2 rounded-none border-r-0 outline-none font-mono text-lg"
        />
        <select 
          bind:value={params.poolUnit}
          class="flex-1 border-2 border-black p-2 rounded-none outline-none bg-white font-bold"
        >
          <option value={PoolSizeUnit.Yards}>Yds</option>
          <option value={PoolSizeUnit.Meters}>M</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Focus -->
  <div>
    <label for="focus" class="block text-sm font-bold uppercase mb-1">Focus</label>
    <select 
      id="focus" 
      bind:value={params.focus}
      class="w-full border-2 border-black p-3 rounded-none bg-white outline-none font-bold text-lg appearance-none"
    >
      {#each focusOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>

  <!-- Stroke Preferences -->
  <div class="space-y-4">
    <span class="block text-sm font-bold uppercase">Stroke Preferences</span>
    <div class="grid grid-cols-1 gap-4">
      {#each strokeOptions as stroke}
        <StrokePreferenceSelector 
          {stroke} 
          value={params.strokePreferences[stroke]} 
          handleChange={(val) => handlePreferenceChange(stroke, val)}
        />
      {/each}
    </div>
  </div>

  <!-- Gear -->
  <div class="border-2 border-black p-4">
    <span class="block text-sm font-bold uppercase mb-3">Available Gear</span>
    <div class="grid grid-cols-2 gap-3">
      {#each gearOptions as gear}
        <label class="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={params.availableGear[gear.key as keyof typeof params.availableGear]}
            class="w-5 h-5 border-2 border-black rounded-none text-black focus:ring-0 checked:bg-black"
          />
          <span class="font-medium">{gear.label}</span>
        </label>
      {/each}
    </div>
  </div>

  <!-- Effort Level (Optional for now, maybe add later or keep simple) -->
  
  <button 
    type="submit"
    class="w-full bg-black text-white text-xl font-bold uppercase py-4 hover:bg-gray-800 transition-colors"
  >
    Generate Workout
  </button>
</form>
