<script lang="ts">
  import type { SavedWorkout } from '$lib/engine/types';
  import { history } from '$lib/stores/history';

  let { workout } = $props<{ workout: SavedWorkout }>();

  function toggleFavorite() {
    history.update({ ...workout, isFavorite: !workout.isFavorite });
  }

  function deleteWorkout() {
    if (confirm('Are you sure you want to delete this workout?')) {
      history.remove(workout.id);
    }
  }
</script>

<div class="border-2 border-black p-4 space-y-2 bg-white relative">
  <div class="flex justify-between items-start">
    <a href="/history/{workout.id}" class="block flex-1">
      <h3 class="font-bold text-lg hover:underline">{workout.name || 'Workout'}</h3>
      <div class="text-xs text-gray-500 font-mono uppercase">
        {new Date(workout.createdAt).toLocaleDateString()} • {new Date(workout.createdAt).toLocaleTimeString()}
      </div>
    </a>
    <button onclick={toggleFavorite} class="text-2xl focus:outline-none z-10 px-2">
      {workout.isFavorite ? '★' : '☆'}
    </button>
  </div>

  <a href="/history/{workout.id}" class="block group">
    <div class="flex space-x-4 text-sm font-bold border-t-2 border-black/10 pt-2 group-hover:bg-gray-50 transition-colors">
      <div>
        <span class="block text-gray-500 text-xs uppercase">Dist</span>
        {workout.totalDistance}
      </div>
      <div>
        <span class="block text-gray-500 text-xs uppercase">Time</span>
        ~{Math.round(workout.estimatedDurationMinutes)}m
      </div>
      <div>
        <span class="block text-gray-500 text-xs uppercase">Focus</span>
        {workout.mainSet?.[0]?.stroke.includes('Pyramid') ? 'Pyramid' : 'Intervals'} 
      </div>
    </div>

    <!-- Summary of segments -->
    <div class="text-xs text-gray-600 mt-2 line-clamp-2">
      Main: {workout.mainSet.length} sets. 
      {workout.mainSet[0]?.description}
    </div>
  </a>

  <div class="pt-3 flex justify-end">
    <button onclick={deleteWorkout} class="text-xs text-red-600 font-bold uppercase hover:underline z-10">
      Delete
    </button>
  </div>
</div>
