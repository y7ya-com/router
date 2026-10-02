<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/login')()
</script>

<script lang="ts">
  import Login from '~/components/Login.svelte'
</script>

<Login />
