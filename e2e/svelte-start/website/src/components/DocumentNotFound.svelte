<script lang="ts">
  import NotFound from './NotFound.svelte'

  let {}: { data?: unknown } = $props()
</script>

<NotFound>Document not found</NotFound>
