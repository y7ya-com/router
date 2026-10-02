<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/about')({})
</script>

<script lang="ts">
  const navigate = Route.useNavigate()
</script>

<div data-testid="about-component">
  <button
    onclick={() => navigate({ to: '/', reloadDocument: true })}
    data-testid="to-home-btn"
  >
    Navigate to / with document reload
  </button>
</div>
