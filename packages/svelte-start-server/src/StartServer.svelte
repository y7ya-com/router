<script lang="ts" generics="TRouter extends AnyRouter">
  import type { AnyRouter } from '@tanstack/router-core'
  import { RouterServer } from '@tanstack/svelte-router/ssr/server'

  let { router }: { router: TRouter } = $props()
</script>

<RouterServer {router} />
