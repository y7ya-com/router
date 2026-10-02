import { createLazyFileRoute } from '@tanstack/svelte-router'
import Component from '../-components/LazyWithLoaderPage.svelte'

export const Route = createLazyFileRoute('/(tests)/lazy-with-loader-page')({
  component: Component,
})
