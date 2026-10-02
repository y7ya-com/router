import { createLazyFileRoute } from '@tanstack/svelte-router'
import Component from '../-components/VirtualPage.svelte'

export const Route = createLazyFileRoute('/(tests)/virtual-page')({
  component: Component,
})
