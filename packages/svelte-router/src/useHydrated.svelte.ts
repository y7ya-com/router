import { onMount } from 'svelte'

/**
 * Return a reactive `{ current: boolean }` indicating if the JS has been hydrated.
 * On the server (or before mount), `current` is `false`. After mount, `current` is `true`.
 */
export function useHydrated(): { readonly current: boolean } {
  let hydrated = $state(false)
  onMount(() => {
    hydrated = true
  })
  return {
    get current() {
      return hydrated
    },
  }
}
