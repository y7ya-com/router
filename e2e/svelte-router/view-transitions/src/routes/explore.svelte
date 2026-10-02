<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="p-2 [view-transition-name:main-content]">
  <h3>
    Explore the CSS to see how to use active-view-transition-type to create new
    viewTransitions to use with Tanstack Router.
  </h3>
  <h4 class={'text-sm mt-2 italic'}>
    Disclaimer: View Transition Types may not be supported in all browsers and
    will fall back to the default browser transition if not available.
  </h4>
  <div class="flex justify-center gap-10 mt-4">
    <!-- see styles.css for 'slide-right' transition -->
    <Link
      to={'/how-it-works'}
      viewTransition={{ types: ['slide-right'] }}
      class="font-bold"
    >
      &lt;- Previous Page
    </Link>
  </div>
</div>
