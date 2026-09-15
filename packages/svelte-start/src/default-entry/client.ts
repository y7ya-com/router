import { hydrate } from 'svelte'
import { StartClient, hydrateStart } from '@tanstack/svelte-start/client'

hydrateStart().then((router) => {
  // The server renders the document body from the same tree StartClient
  // renders, so the whole body is hydrated.
  hydrate(StartClient, { target: document.body, props: { router } })
})
