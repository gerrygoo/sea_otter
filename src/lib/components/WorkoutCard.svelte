<script lang="ts">
  import type { Workout, SwimSet, PoolSizeUnit, SavedWorkout } from '$lib/engine/types';

  let { 
    workout, 
    title, 
    onClick,
    actionLabel = "Select This Workout",
    actions = []
  } = $props<{ 
    workout: Workout | SavedWorkout, 
    title: string,
    onClick: () => void,
    actionLabel?: string,
    actions?: { label: string, onClick: (e: Event) => void }[]
  }>();

  let isMenuOpen = $state(false);

  function getSegmentSummary(sets: SwimSet[], unit?: PoolSizeUnit) {
    if (!sets || sets.length === 0) return '-';
    const dist = sets.reduce((acc, s) => acc + s.distance * s.reps, 0);
    const unitLabel = unit === 'meters' ? 'm' : 'y';
    
    const strokes = Array.from(new Set(sets.map(s => {
        if (s.stroke.includes('Kick')) return 'Kick';
        if (s.stroke.includes('Drill')) return 'Drill';
        return s.stroke; 
    })));
    
    const strokeStr = strokes.length > 2 ? 'Mix' : strokes.join('/');
    
    return `${dist}${unitLabel} ${strokeStr}`;
  }

  function toggleMenu(e: Event) {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
  }

  // Close menu when clicking elsewhere
  function handleWindowClick() {
    isMenuOpen = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div 
  class="text-left border-4 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group relative w-full flex flex-col"
>
  <!-- Header -->
  <div class="bg-black text-white p-4 flex justify-between items-center relative z-10">
      <div class="flex-1 min-w-0 cursor-pointer" onclick={onClick}>
          <h3 class="font-bold text-xl uppercase truncate pr-2">{title}</h3>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
          <div class="hidden sm:flex gap-2 text-xs font-bold text-black mr-2 cursor-pointer" onclick={onClick}>
              <span class="bg-white px-2 py-1">{workout.totalDistance} {workout.poolUnit === 'meters' ? 'm' : 'yds'}</span>
              <span class="bg-white px-2 py-1">~{Math.round(workout.estimatedDurationMinutes)} min</span>
          </div>
          
          {#if actions.length > 0}
            <div class="relative z-20">
                <button 
                  type="button"
                  class="p-1 hover:bg-white/20 transition-colors rounded"
                  onclick={toggleMenu}
                  aria-label="Actions"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                
                {#if isMenuOpen}
                    <div class="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30">
                        {#each actions as action}
                            <button 
                                type="button"
                                class="w-full text-left px-4 py-2 text-black font-bold uppercase text-sm hover:bg-yellow-400 transition-colors border-b-2 last:border-b-0 border-black/10"
                                onclick={(e) => { e.stopPropagation(); isMenuOpen = false; action.onClick(e); }}
                            >
                                {action.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
          {/if}
      </div>
  </div>
  
  <!-- Content Area - Clickable -->
  <div class="p-6 space-y-4 flex-1 cursor-pointer hover:bg-yellow-50 transition-colors" onclick={onClick}>
       <!-- Mobile Stats -->
       <div class="flex sm:hidden gap-2 text-xs font-bold">
          <span class="border-2 border-black px-2 py-1 bg-white">{workout.totalDistance} {workout.poolUnit === 'meters' ? 'm' : 'yds'}</span>
          <span class="border-2 border-black px-2 py-1 bg-white">~{Math.round(workout.estimatedDurationMinutes)} min</span>
       </div>

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
                       <span class="text-gray-600 text-xs text-left sm:text-right flex-1 leading-tight">{set.description}</span>
                  </li>
              {/each}
          </ul>
       </div>

       <!-- Other Parts Summary -->
       <div class="grid grid-cols-3 gap-2 text-xs text-gray-600 pt-2 border-t-2 border-black/10">
          <div>
              <span class="block font-bold uppercase text-[10px] text-gray-400">Warmup</span>
              {getSegmentSummary(workout.warmup, workout.poolUnit)}
          </div>
          <div>
              <span class="block font-bold uppercase text-[10px] text-gray-400">Preset</span>
              {getSegmentSummary(workout.preset, workout.poolUnit)}
          </div>
          <div>
              <span class="block font-bold uppercase text-[10px] text-gray-400">Cooldown</span>
              {getSegmentSummary(workout.cooldown, workout.poolUnit)}
          </div>
       </div>
  </div>

  <!-- CTA -->
  <div 
    onclick={onClick}
    class="bg-gray-100 p-3 text-center font-bold uppercase text-sm border-t-4 border-black group-hover:bg-black group-hover:text-white transition-colors cursor-pointer"
  >
      {actionLabel}
  </div>
</div>