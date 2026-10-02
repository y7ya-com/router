<script lang="ts">
  import { useBlocker, useNavigate } from '@tanstack/svelte-router'

  const navigate = useNavigate()
  let input = $state('')

  const blocker = useBlocker({
    shouldBlockFn: () => !!input,
    withResolver: true,
  })
</script>

<div>
  <h1>Editing B</h1>
  <label>
    Enter your name:
    <input name="input" bind:value={input} />
  </label>
  <button onclick={() => navigate({ to: '/editing-a' })}>Go back</button>
  {#if blocker.current.status === 'blocked'}
    <button onclick={() => blocker.current.proceed?.()}>Proceed</button>
  {/if}
</div>
