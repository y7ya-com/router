<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')({})
</script>

<script lang="ts">
  import CustomMessage from '~/components/CustomMessage.svelte'
</script>

<div class="p-2">
  <h3>Welcome Home!!!</h3>
  <CustomMessage message="Hello from a custom component!" />
</div>
