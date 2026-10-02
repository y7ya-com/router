import { mount } from 'svelte'
import { RouterProvider } from '@tanstack/svelte-router'
import { router } from './app'

const rootEl = document.getElementById('root')

if (rootEl && !rootEl.innerHTML) {
  mount(RouterProvider, { target: rootEl, props: { router } })
}
