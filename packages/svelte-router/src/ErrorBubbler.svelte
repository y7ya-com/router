<script lang="ts">
  // Rethrows an error during render so the nearest ancestor
  // `<svelte:boundary>` (the parent Match's boundary) catches it and renders
  // the ancestor's errorComponent.
  let { error }: { error: unknown } = $props()
  if (error) throw error
</script>
