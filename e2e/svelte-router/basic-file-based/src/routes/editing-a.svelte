<script lang="ts">
  import { useBlocker, useNavigate } from '@tanstack/svelte-router'

  const navigate = useNavigate()
  let input = $state('')

  const blocker = useBlocker({
    shouldBlockFn: ({ next }) => {
      if (next.fullPath === '/editing-b' && input.length > 0) {
        return true
      }
      return false
    },
    withResolver: true,
  })
</script>

<div>
  <h1>Editing A</h1>
  <label>
    Enter your name:
    <input name="input" bind:value={input} />
  </label>
  <button onclick={() => navigate({ to: '/editing-b' })}>Go to next step</button
  >
  {#if blocker.current.status === 'blocked'}
    <button onclick={() => blocker.current.proceed?.()}>Proceed</button>
  {/if}
</div>
