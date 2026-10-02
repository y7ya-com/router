import { createFileRoute } from '@tanstack/svelte-router'
import EditingAComponent from '../components/EditingAComponent.svelte'

export const Route = createFileRoute('/editing-a')({
  component: EditingAComponent,
})
