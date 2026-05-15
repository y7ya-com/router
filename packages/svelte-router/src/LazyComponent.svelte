<script lang="ts">
  import type { Component } from 'svelte'

  // Adapter component for `lazyRouteComponent`. Awaits the import promise on
  // first render, caches the resolved component, then renders it with the
  // forwarded `childProps`. Subsequent renders skip the await and go straight
  // to the resolved component.
  let {
    load,
    getComp,
    childProps,
  }: {
    load: () => Promise<unknown>
    getComp: () => Component<any> | undefined
    childProps: Record<string, unknown>
  } = $props()

  const initial = getComp()
  let Comp = $state<Component<any> | undefined>(initial)

  // If not already resolved, kick off the import and update state once done.
  $effect(() => {
    if (Comp) return
    load().then(() => {
      Comp = getComp()
    })
  })
</script>

{#if Comp}
  {@const C = Comp}
  <C {...childProps} />
{/if}
