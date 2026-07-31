import { hydrate } from 'svelte'
import { StartClient, hydrateStart } from '@tanstack/svelte-start/client'

hydrateStart().then((router) => {
  // The RouterServer shell renders the app inside `<div id="app">`; hydrate
  // only that element so the server and client trees match.
  const target = document.getElementById('app')
  if (!target) throw new Error('tanstack-svelte-start: missing #app element')
  hydrate(StartClient, { target, props: { router } })
})
