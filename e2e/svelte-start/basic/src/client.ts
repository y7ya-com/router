// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom client entry is working
import { hydrate } from 'svelte'
import { StartClient, hydrateStart } from '@tanstack/svelte-start/client'

console.log("[client-entry]: using custom client entry in 'src/client.ts'")

hydrateStart().then((router) => {
  hydrate(StartClient, {
    target: document.body,
    props: { router },
  })
})
