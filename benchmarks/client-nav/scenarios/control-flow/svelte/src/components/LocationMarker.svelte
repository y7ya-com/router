<script lang="ts">
  import { useLocation } from '@tanstack/svelte-router'

  const pathname = useLocation({ select: (location) => location.pathname })
</script>

<span data-testid="loc">{pathname.current}</span>
