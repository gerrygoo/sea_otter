<script lang="ts">
  import type { Workout, SwimSet } from '$lib/engine/types';
  import { formatDuration } from '$lib/engine/utils';
  import { EffortIntensity } from '$lib/engine/pace_logic';

  let { workout } = $props<{ workout: Workout }>();

  function getTargetTime(set: SwimSet): string | null {
    if (!set.targetPacePer100) return null;
    const totalSeconds = (set.distance / 100) * set.targetPacePer100;
    return formatDuration(totalSeconds);
  }

  function getIntensityColor(intensity?: string | EffortIntensity): string {
    if (!intensity) return 'text-gray-600';
    if (intensity === EffortIntensity.Easy) return 'text-blue-600';
    if (intensity === EffortIntensity.Neutral) return 'text-green-600';
    if (intensity === EffortIntensity.Hard) return 'text-red-600';
    return 'text-gray-600';
  }
</script>

<div class="space-y-6">
  <!-- Summary Stats -->
  <div class="grid grid-cols-2 gap-4 text-center">
    <div class="border-2 border-black p-2">
      <span class="block text-xs uppercase text-gray-500">Distance</span>
      <span class="text-xl font-black">{workout.totalDistance}</span>
    </div>
    <div class="border-2 border-black p-2">
      <span class="block text-xs uppercase text-gray-500">Duration</span>
      <span class="text-xl font-black">~{Math.round(workout.estimatedDurationMinutes)} min</span>
    </div>
  </div>

  <!-- Segments -->
  {#each ['warmup', 'preset', 'mainSet', 'cooldown'] as segment}
    {#if workout[segment as keyof Workout] && (workout[segment as keyof Workout] as any[]).length > 0}
      <div class="space-y-2">
        <h2 class="font-black uppercase bg-black text-white px-2 py-1 inline-block">
          {segment.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
        <ul class="space-y-3">
          {#each workout[segment as keyof Workout] as set}
            <li class="border-l-4 border-black pl-3 py-1">
              <div class="font-bold text-lg leading-tight">
                {set.reps} x {set.distance} 
                <span class="text-gray-600">@ </span>
                {#if set.targetPacePer100}
                  <span class="font-mono {getIntensityColor(set.intensity)}">
                    {getTargetTime(set)}
                  </span>
                {:else}
                  <span class="text-gray-600">{set.intervalSeconds ? set.intervalSeconds + 's' : 'rest'}</span>
                {/if}
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
</div>
