<script lang="ts" generics="T">
  import type { Snippet } from 'svelte'
  import { defer } from '@tanstack/router-core'

  type Props = {
    promise: Promise<T>
    fallback?: Snippet
    children: Snippet<[T]>
  }

  let { promise, fallback, children }: Props = $props()

  let state = $state<{ status: 'pending' } | { status: 'done'; data: T } | { status: 'error'; error: unknown }>({
    status: 'pending',
  })

  $effect(() => {
    const p = defer(promise)
    let cancelled = false
    Promise.resolve(p)
      .then((data) => {
        if (!cancelled) state = { status: 'done', data: data as T }
      })
      .catch((error) => {
        if (!cancelled) state = { status: 'error', error }
      })
    return () => {
      cancelled = true
    }
  })
</script>

{#if state.status === 'pending'}
  {#if fallback}{@render fallback()}{/if}
{:else if state.status === 'error'}
  {(() => { throw state.error })()}
{:else}
  {@render children(state.data)}
{/if}
