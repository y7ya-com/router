<script lang="ts">
  const LazySharedWidget = import('~/components/SharedWidgetLazy.svelte')
</script>

<section>
  <h1 data-testid="lazy-css-lazy-heading">Lazy CSS Repro - Lazy Route</h1>
  <p>
    This route renders the same widget through a lazy component so the CSS only
    exists behind a dynamic import boundary.
  </p>

  {#await LazySharedWidget}
    <div data-testid="shared-widget-loading">Loading...</div>
  {:then { default: SharedWidgetLazy }}
    <SharedWidgetLazy />
  {/await}
</section>
