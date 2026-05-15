<script lang="ts">
  import { RouterProvider } from '@tanstack/svelte-router'

  let { router } = $props()
</script>

<RouterProvider {router} />
