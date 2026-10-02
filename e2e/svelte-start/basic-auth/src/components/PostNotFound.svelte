<script lang="ts">
  import NotFound from './NotFound.svelte'

  let {}: { data?: unknown } = $props()
</script>

<NotFound>Post not found</NotFound>
