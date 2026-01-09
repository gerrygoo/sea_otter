<script lang="ts">
  let { initialName, isOpen, onSave, onCancel } = $props<{
    initialName: string,
    isOpen: boolean,
    onSave: (newName: string) => void,
    onCancel: () => void
  }>();

  let newName = $state(initialName);

  // Sync state if initialName changes (e.g. when opening for a different workout)
  $effect(() => {
    newName = initialName;
  });

  function handleSubmit() {
    onSave(newName);
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onclick={(e) => { if (e.target === e.currentTarget) onCancel() }}
  >
    <div class="bg-white border-4 border-black w-full max-w-sm p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-xl font-black uppercase mb-4">Rename Workout</h3>
      
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div>
          <label for="rename-input" class="block text-xs font-bold uppercase text-gray-500 mb-1">New Name</label>
          <input 
            id="rename-input"
            type="text" 
            bind:value={newName}
            class="w-full border-2 border-black p-2 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter name..."
            autofocus
          />
        </div>

        <div class="flex space-x-3 pt-2">
          <button 
            type="submit"
            class="flex-1 bg-black text-white py-2 font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
          <button 
            type="button"
            onclick={onCancel}
            class="flex-1 border-2 border-black py-2 font-bold uppercase hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
