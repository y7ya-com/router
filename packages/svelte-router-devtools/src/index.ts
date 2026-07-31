import DevToolsComponent from './TanStackRouterDevtools.svelte'
import DevToolsPanelComponent from './TanStackRouterDevtoolsPanel.svelte'
import NullComponent from './NullDevtools.svelte'

// Mirrors vue-router-devtools: the devtools render nothing in production
// builds unless the *InProd variant is used explicitly.
export const TanStackRouterDevtools =
  process.env.NODE_ENV !== 'development' ? NullComponent : DevToolsComponent

export const TanStackRouterDevtoolsInProd = DevToolsComponent

export const TanStackRouterDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? NullComponent
    : DevToolsPanelComponent

export const TanStackRouterDevtoolsPanelInProd = DevToolsPanelComponent
