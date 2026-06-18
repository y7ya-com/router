import { hydrate } from 'svelte'
import { RouterClient } from '@tanstack/svelte-router/ssr/client'
import { createRouter } from './router'

const router = createRouter()

hydrate(RouterClient, { target: document.body, props: { router } })
