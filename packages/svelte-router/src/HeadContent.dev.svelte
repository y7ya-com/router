<script lang="ts">
  import { DEV_STYLES_ATTR } from '@tanstack/router-core'
  import HeadContent from './HeadContent.svelte'
  import { useHydrated } from './useHydrated.svelte'

  // Development variant — mirrors solid-router's HeadContent.dev: once
  // hydration completes, remove any dev-styles links Vite injected during SSR
  // so they don't linger alongside the client-injected styles. The production
  // component never carries DEV_STYLES_ATTR tags, so it skips all of this.
  const hydrated = useHydrated()

  $effect(() => {
    if (hydrated.current) {
      document
        .querySelectorAll(`link[${DEV_STYLES_ATTR}]`)
        .forEach((el) => el.remove())
    }
  })
</script>

<HeadContent />
