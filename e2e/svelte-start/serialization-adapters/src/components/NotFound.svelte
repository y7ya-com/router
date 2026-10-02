<script lang="ts">
  let { data }: { data?: unknown } = $props()
</script>

<div>404 - Not Found {JSON.stringify(data)}</div>
