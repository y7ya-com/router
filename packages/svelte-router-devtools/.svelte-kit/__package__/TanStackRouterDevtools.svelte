<script lang="ts">
  import { onMount } from 'svelte'
  import { TanStackRouterDevtoolsCore } from '@tanstack/router-devtools-core'
  import { useRouter, useRouterState } from '@tanstack/svelte-router'
  import type { AnyRouter } from '@tanstack/svelte-router'

  type Props = {
    /** Set this true if you want the dev tools to default to being open */
    initialIsOpen?: boolean
    /** Props for the panel (className, style, …) */
    panelProps?: Record<string, any>
    /** Props for the close button */
    closeButtonProps?: Record<string, any>
    /** Props for the toggle button */
    toggleButtonProps?: Record<string, any>
    /** Position of the TanStack Router logo. Defaults to 'bottom-left'. */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    /** Container element type for a11y purposes. Defaults to 'footer'. */
    containerElement?: string | any
    /** The router instance to use. Falls back to the router in context. */
    router?: AnyRouter
    /** Attach the devtools styles to a specific ShadowRoot. */
    shadowDOMTarget?: ShadowRoot
  }

  let {
    initialIsOpen,
    panelProps,
    closeButtonProps,
    toggleButtonProps,
    position,
    containerElement,
    router,
    shadowDOMTarget,
  }: Props = $props()

  const hookRouter = useRouter({ warn: false })
  const activeRouter = $derived((router ?? hookRouter) as AnyRouter)

  const routerStateSel = useRouterState({ router: (router ?? hookRouter) as any })

  // svelte-ignore non_reactive_update — bound once at mount, never reassigned
  let devToolsEl: HTMLDivElement | undefined

  const devtools = new TanStackRouterDevtoolsCore({
    initialIsOpen,
    panelProps,
    closeButtonProps,
    toggleButtonProps,
    position,
    containerElement,
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
      initialIsOpen,
      panelProps,
      closeButtonProps,
      toggleButtonProps,
      position,
      containerElement,
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
