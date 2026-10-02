import { createFileRoute } from '@tanstack/svelte-router'
import EditingBComponent from '../components/EditingBComponent.svelte'

export const Route = createFileRoute('/editing-b')({
  component: EditingBComponent,
})
