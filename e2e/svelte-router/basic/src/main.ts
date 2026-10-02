import { mount } from 'svelte'
import { RouterProvider } from '@tanstack/svelte-router'
import { router } from './router'
import './styles.css'

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
