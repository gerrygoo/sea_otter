<script lang="ts">
  import { page } from '$app/state';
</script>

<nav class="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black z-50">
  <div class="flex justify-around items-center h-16">
    <a 
      href="/" 
      class="flex-1 flex flex-col items-center justify-center h-full hover:bg-gray-100 transition-colors"
      class:font-bold={page.url.pathname === '/'}
    >
      <span>Generate</span>
    </a>
    <a 
      href="/history" 
      class="flex-1 flex flex-col items-center justify-center h-full hover:bg-gray-100 transition-colors"
      class:font-bold={page.url.pathname === '/history'}
    >
      <span>History</span>
    </a>
    <a 
      href="/favorites" 
      class="flex-1 flex flex-col items-center justify-center h-full hover:bg-gray-100 transition-colors"
      class:font-bold={page.url.pathname === '/favorites'}
    >
      <span>Favorites</span>
    </a>
  </div>
</nav>

<!-- Spacer to prevent content from being hidden behind the fixed nav -->
<div class="h-16"></div>
