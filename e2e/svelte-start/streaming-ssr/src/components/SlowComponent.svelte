<script lang="ts">
  let { data, index }: { data: string; index: number } = $props()

  const startTime = Date.now()
  while (Date.now() - startTime < 100) {
    // Simulate slow render work.
  }
</script>

<div data-testid={`slow-component-${index}`}>{data}</div>
