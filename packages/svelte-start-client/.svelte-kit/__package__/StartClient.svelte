<script lang="ts" generics="TRouter extends AnyRouter">
  import { onMount, tick } from 'svelte'
  import type { AnyRouter } from '@tanstack/router-core'
  import { RouterClient } from '@tanstack/svelte-router/ssr/client'

  let { router }: { router: TRouter } = $props()

  // After Svelte hydration completes, signal that router hydration is done so
  // stream cleanup can run. The tick waits for child onMount work before
  // allowing cleanup.
  onMount(() => {
    void tick().then(() => {
      ;(window as any).$_TSR?.h()
    })
  })
</script>

<RouterClient {router} />
