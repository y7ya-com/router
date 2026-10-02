<script lang="ts">
  import NotFound from './NotFound.svelte'

  let { data: _data }: { data?: unknown } = $props()
</script>

<NotFound>User not found</NotFound>
