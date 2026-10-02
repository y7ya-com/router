<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')({})
</script>

<script lang="ts">
  const navigate = Route.useNavigate()
</script>

<div data-testid="home-component">
  <button
    data-testid="to-about-btn"
    onclick={() =>
      navigate({
        to: '/about',
        reloadDocument: true,
      })}
  >
    Navigate to /about with document reload
  </button>
</div>
