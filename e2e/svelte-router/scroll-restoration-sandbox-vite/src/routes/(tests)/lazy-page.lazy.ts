import { createLazyFileRoute } from '@tanstack/svelte-router'
import Component from '../-components/LazyPage.svelte'

export const Route = createLazyFileRoute('/(tests)/lazy-page')({
  component: Component,
})
