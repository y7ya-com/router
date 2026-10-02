<script lang="ts">
  let { error }: { error: unknown } = $props()
</script>

<div>{error instanceof Error ? error.message : String(error)}</div>
