import { mount } from 'svelte'
import { RouterProvider, createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'
import './styles.css'

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
})

const rootElement = document.getElementById('app')

if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
