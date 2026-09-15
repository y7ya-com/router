import DevToolsComponent from './TanStackRouterDevtools.svelte'
import DevToolsPanelComponent from './TanStackRouterDevtoolsPanel.svelte'
import NullComponent from './NullDevtools.svelte'

// The devtools render nothing in production builds unless the *InProd
// variant is used explicitly.
// `NullComponent` declares no props; widen it through `unknown` so both tsc
// and svelte-check accept the assignment.
const Null = NullComponent as unknown as typeof DevToolsComponent

export const TanStackRouterDevtools: typeof DevToolsComponent =
  process.env.NODE_ENV !== 'development' ? Null : DevToolsComponent

export const TanStackRouterDevtoolsInProd = DevToolsComponent

export const TanStackRouterDevtoolsPanel: typeof DevToolsPanelComponent =
  process.env.NODE_ENV !== 'development'
    ? (Null as unknown as typeof DevToolsPanelComponent)
    : DevToolsPanelComponent

export const TanStackRouterDevtoolsPanelInProd = DevToolsPanelComponent
