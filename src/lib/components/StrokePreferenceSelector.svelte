<script lang="ts">
  import { StrokeStyle, type StrokePreferenceValue } from '$lib/engine/types';

  let { stroke, value, handleChange } = $props<{
    stroke: StrokeStyle;
    value: StrokePreferenceValue;
    handleChange: (val: StrokePreferenceValue) => void;
  }>();

  const levels: { value: StrokePreferenceValue; label: string; shortLabel: string }[] = [
    { value: 1, label: 'Never', shortLabel: 'No' },
    { value: 2, label: 'Rarely', shortLabel: 'Rare' },
    { value: 3, label: 'Occasionally', shortLabel: 'Occ' },
    { value: 4, label: 'Often', shortLabel: 'Often' },
    { value: 5, label: 'Primary', shortLabel: 'Pri' }
  ];
</script>

<div class="space-y-1">
  <span class="text-xs font-bold uppercase text-gray-500">{stroke}</span>
  <div class="flex w-full border-2 border-black divide-x-2 divide-black">
    {#each levels as level}
      <button
        type="button"
        onclick={() => handleChange(level.value)}
        class="flex-1 py-2 text-[10px] sm:text-xs font-bold transition-colors
          {value === level.value ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}"
      >
        <span class="hidden sm:inline">{level.label}</span>
        <span class="inline sm:hidden">{level.shortLabel}</span>
      </button>
    {/each}
  </div>
</div>
