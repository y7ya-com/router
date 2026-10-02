<script lang="ts">
  import { ClientOnly } from '@tanstack/svelte-router'
  import SharedWidget from '~/components/SharedWidget.svelte'
</script>

<section>
  <h1>Lazy CSS Repro - Static Route</h1>
  <p>
    This route statically imports the shared widget so its CSS is present in the
    SSR head.
  </p>

  <ClientOnly>
    <div data-testid="lazy-css-static-hydrated">hydrated</div>
  </ClientOnly>

  <SharedWidget />
</section>
