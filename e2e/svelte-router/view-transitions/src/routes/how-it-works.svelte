<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="p-2 [view-transition-name:main-content]">
  <h3>This example demonstrates a variety of custom page transitions.</h3>
  <div class="flex justify-center gap-10 mt-4">
    <!-- see styles.css for 'slide-right' transition -->
    <Link
      to={'/'}
      viewTransition={{ types: ['slide-right'] }}
      class="font-bold"
    >
      &lt;- Previous Page
    </Link>
    <!-- see styles.css for 'slide-left' transition -->
    <Link
      to={'/explore'}
      viewTransition={{ types: ['slide-left'] }}
      class="font-bold"
    >
      Next Page -&gt;
    </Link>
  </div>
</div>
