<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="p-2 [view-transition-name:main-content]">
  <h3>Welcome To The View Transitions Example!</h3>
  <div class="flex justify-center mt-4">
    <!-- see styles.css for 'slide-left' transition -->
    <Link
      to={'/how-it-works'}
      viewTransition={{ types: ['slide-left'] }}
      class="font-bold"
    >
      Next Page -&gt;
    </Link>
  </div>
</div>
