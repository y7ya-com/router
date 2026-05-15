<script lang="ts">
  // Helper component that rethrows an error during render so the nearest
  // ancestor `<svelte:boundary>` (i.e. the parent Match's boundary) catches it
  // and renders the ancestor's errorComponent. Mirrors solid-router's
  // CatchBoundary re-throw mechanism for route-level error bubbling.
  let { error }: { error: unknown } = $props()
  if (error) throw error
</script>
