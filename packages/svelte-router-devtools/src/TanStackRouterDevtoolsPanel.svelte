<script lang="ts">
  import { onMount } from 'svelte'
  import { TanStackRouterDevtoolsPanelCore } from '@tanstack/router-devtools-core'
  import { useRouter, useRouterState } from '@tanstack/svelte-router'
  import type { AnyRouter } from '@tanstack/svelte-router'

  type Props = {
    /** Inline styles for the panel */
    style?: any
    /** Class for the panel */
    className?: string
    /** Whether the panel is open */
    isOpen?: boolean
    /** Toggles the open/close state of the panel */
    setIsOpen?: (isOpen: boolean) => void
    /** Handles dragging the devtools panel */
    handleDragStart?: (e: any) => void
    /** The router instance to use. Falls back to the router in context. */
    router?: AnyRouter
    /** Attach the devtools styles to a specific ShadowRoot. */
    shadowDOMTarget?: ShadowRoot
  }

  let {
    style,
    className,
    isOpen,
    setIsOpen,
    handleDragStart,
    router,
    shadowDOMTarget,
  }: Props = $props()

  const hookRouter = useRouter({ warn: false })
  const activeRouter = $derived((router ?? hookRouter) as AnyRouter)

  // svelte-ignore state_referenced_locally
  const routerStateSel = useRouterState({
    router: (router ?? hookRouter) as any,
  })

  let devToolsEl: HTMLDivElement | undefined

  // svelte-ignore state_referenced_locally
  const devtools = new TanStackRouterDevtoolsPanelCore({
    style,
    className,
    isOpen,
    setIsOpen,
    handleDragStart,
    shadowDOMTarget,
    router: (router ?? hookRouter) as any,
    routerState: routerStateSel.current as any,
  })

  $effect(() => {
    devtools.setRouter(activeRouter as any)
  })

  $effect(() => {
    devtools.setRouterState(routerStateSel.current as any)
  })

  $effect(() => {
    devtools.setOptions({
      className,
      style,
      shadowDOMTarget,
    })
  })

  onMount(() => {
    if (devToolsEl) {
      devtools.mount(devToolsEl)
      return () => devtools.unmount()
    }
    return undefined
  })
</script>

<div bind:this={devToolsEl}></div>
