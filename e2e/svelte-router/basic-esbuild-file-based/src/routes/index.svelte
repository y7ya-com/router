<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')({})
</script>

<script lang="ts">
  import SvelteLogo from '../components/SvelteLogo.svelte'
</script>

<div class="p-2">
  <h3>Welcome Home!</h3>
  <SvelteLogo textColor="orange" />
</div>
