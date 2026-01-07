<script lang="ts">
  import { onMount } from 'svelte';
  import { PoolSizeUnit, TrainingFocus, StrokeStyle } from '$lib/engine/types';
  import type { WorkoutParameters, StrokePreferenceValue } from '$lib/engine/types';
  import StrokePreferenceSelector from './StrokePreferenceSelector.svelte';
  import { settingsStore } from '$lib/stores/settings';
  import { calculateCSSPace } from '$lib/engine/css_utils';

  let { onGenerate } = $props<{ onGenerate: (params: WorkoutParameters) => void }>();

  let params = $state<WorkoutParameters>({
    poolSize: 25,
    poolUnit: PoolSizeUnit.Meters,
    totalTimeMinutes: 60,
    availableGear: {
      fins: false,
      kickboard: false,
      pullBuoy: false,
      paddles: false,
      snorkel: false
    },
    focus: TrainingFocus.Mixed,
    preferredStrokes: [],
    strokePreferences: $settingsStore.strokePreferences, // Use store values for the rest
    effortLevel: 5,
    cssPace: $settingsStore.cssPace,
    optionCount: 3
  });

  // CSS UI State
  let cssMode = $state<'manual' | 'calc'>('manual');
  let manualMin = $state(0);
  let manualSec = $state(0);
  let calc400Min = $state(0);
  let calc400Sec = $state(0);
  let calc200Min = $state(0);
  let calc200Sec = $state(0);

  onMount(() => {
    settingsStore.load();
    params = $settingsStore;
    
    if (params.cssPace) {
      manualMin = Math.floor(params.cssPace / 60);
      manualSec = Math.round(params.cssPace % 60);
    }
  });

  const focusOptions = Object.values(TrainingFocus);
  
  // Split strokes into standard strokes and technique types
  const allStrokes = Object.values(StrokeStyle);
  const standardStrokes = allStrokes.filter(s => 
    s !== StrokeStyle.Choice && s !== StrokeStyle.Drill && s !== StrokeStyle.Kick && s !== StrokeStyle.Pull
  );
  const techniqueStrokes = [StrokeStyle.Drill, StrokeStyle.Kick, StrokeStyle.Pull];

  const gearOptions = [
    { key: 'fins', label: 'Fins' },
    { key: 'kickboard', label: 'Kickboard' },
    { key: 'pullBuoy', label: 'Pull Buoy' },
    { key: 'paddles', label: 'Paddles' },
    { key: 'snorkel', label: 'Snorkel' }
  ];

  function handlePreferenceChange(stroke: StrokeStyle, val: StrokePreferenceValue) {
    params.strokePreferences[stroke as keyof typeof params.strokePreferences] = val;
    settingsStore.set($state.snapshot(params));
  }

  function handleManualCSSChange() {
    params.cssPace = manualMin * 60 + manualSec;
    if (params.cssPace === 0) params.cssPace = undefined;
  }

  function handleCalculateCSS() {
    const t400 = calc400Min * 60 + calc400Sec;
    const t200 = calc200Min * 60 + calc200Sec;
    const result = calculateCSSPace(t400, t200);
    if (result !== null) {
      params.cssPace = result;
      manualMin = Math.floor(result / 60);
      manualSec = Math.round(result % 60);
      cssMode = 'manual';
    }
  }

  // Update store when other params change (we could also use $settingsStore directly but params is easier for binding)
  $effect(() => {
    settingsStore.set($state.snapshot(params));
  });

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

  <!-- Performance (CSS) -->
  <div class="border-2 border-black p-4 bg-gray-50">
    <div class="flex justify-between items-center mb-4">
      <span class="block text-sm font-bold uppercase">Performance (CSS)</span>
      <div class="flex bg-white border-2 border-black text-xs">
        <button 
          type="button"
          class="px-2 py-1 {cssMode === 'manual' ? 'bg-black text-white' : ''}"
          onclick={() => cssMode = 'manual'}
        >Manual</button>
        <button 
          type="button"
          class="px-2 py-1 {cssMode === 'calc' ? 'bg-black text-white' : ''}"
          onclick={() => cssMode = 'calc'}
        >Calc</button>
      </div>
    </div>

    {#if cssMode === 'manual'}
      <div class="flex items-end space-x-2">
        <div class="flex-1">
          <label for="manualMin" class="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pace per 100 ({params.poolUnit === PoolSizeUnit.Meters ? 'm' : 'yd'})</label>
          <div class="flex items-center space-x-1">
            <input 
              type="number" 
              id="manualMin"
              bind:value={manualMin} 
              oninput={handleManualCSSChange}
              class="w-full border-2 border-black p-2 rounded-none font-mono text-center"
              placeholder="MM"
            />
            <span class="font-bold">:</span>
            <input 
              type="number" 
              id="manualSec"
              aria-label="Pace Seconds"
              bind:value={manualSec} 
              oninput={handleManualCSSChange}
              class="w-full border-2 border-black p-2 rounded-none font-mono text-center"
              placeholder="SS"
            />
          </div>
        </div>
      </div>
    {:else}
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="calc400Min" class="block text-[10px] font-bold uppercase text-gray-500 mb-1">400 Best Time</label>
            <div class="flex items-center space-x-1">
              <input type="number" id="calc400Min" bind:value={calc400Min} class="w-full border-2 border-black p-1 rounded-none font-mono text-sm text-center" placeholder="MM" />
              <span>:</span>
              <input type="number" aria-label="400 Best Time Seconds" bind:value={calc400Sec} class="w-full border-2 border-black p-1 rounded-none font-mono text-sm text-center" placeholder="SS" />
            </div>
          </div>
          <div>
            <label for="calc200Min" class="block text-[10px] font-bold uppercase text-gray-500 mb-1">200 Best Time</label>
            <div class="flex items-center space-x-1">
              <input type="number" id="calc200Min" bind:value={calc200Min} class="w-full border-2 border-black p-1 rounded-none font-mono text-sm text-center" placeholder="MM" />
              <span>:</span>
              <input type="number" aria-label="200 Best Time Seconds" bind:value={calc200Sec} class="w-full border-2 border-black p-1 rounded-none font-mono text-sm text-center" placeholder="SS" />
            </div>
          </div>
        </div>
        <button 
          type="button" 
          onclick={handleCalculateCSS}
          class="w-full bg-white border-2 border-black py-1 font-bold text-sm uppercase hover:bg-gray-100"
        >
          Calculate CSS
        </button>
      </div>
    {/if}
    <p class="text-[10px] text-gray-500 mt-2 leading-tight italic">
      CSS (Critical Swim Speed) is used to generate personalized target times.
    </p>
  </div>

  <!-- Stroke Preferences -->
  <div class="space-y-4">
    <span class="block text-sm font-bold uppercase">Stroke Preferences</span>
    <div class="grid grid-cols-1 gap-4">
      {#each standardStrokes as stroke}
        <StrokePreferenceSelector 
          {stroke} 
          value={params.strokePreferences[stroke as keyof typeof params.strokePreferences]} 
          handleChange={(val) => handlePreferenceChange(stroke, val)}
        />
      {/each}
    </div>
  </div>

  <!-- Focus -->
  <div>
    <label for="focus" class="block text-sm font-bold uppercase mb-1">Main Focus</label>
    <select 
      id="focus" 
      bind:value={params.focus}
      class="w-full border-2 border-black p-3 rounded-none bg-white outline-none font-bold text-lg appearance-none"
    >
      {#each focusOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
    <p class="text-xs text-gray-500 mt-2 leading-tight">
      Determines the intensity and structure of the main set.
    </p>
  </div>

  <!-- Technique Focus -->
  <div class="space-y-4">
    <span class="block text-sm font-bold uppercase">Technique Focus</span>
    <div class="grid grid-cols-1 gap-4">
      {#each techniqueStrokes as stroke}
        <StrokePreferenceSelector 
          {stroke} 
          value={params.strokePreferences[stroke as keyof typeof params.strokePreferences]} 
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

  <!-- Generation Options -->
  <div>
    <label for="optionCount" class="block text-sm font-bold uppercase mb-1">Workout Options</label>
    <div class="flex items-center justify-between border-2 border-black p-2 bg-white">
      <span class="text-sm font-medium">How many variations?</span>
      <div class="flex items-center space-x-2">
        <input 
          type="range" 
          id="optionCount" 
          bind:value={params.optionCount} 
          min="1" 
          max="10"
          step="1"
          class="w-32 accent-black"
        />
        <span class="font-mono font-bold text-lg w-6 text-center">{params.optionCount ?? 3}</span>
      </div>
    </div>
  </div>

  <button 
    type="submit"
    class="w-full bg-black text-white text-xl font-bold uppercase py-4 hover:bg-gray-800 transition-colors"
  >
    Generate {params.optionCount ?? 3} Workout{(params.optionCount ?? 3) > 1 ? 's' : ''}
  </button>
</form>
