<script lang="ts">
  import { setupScrollRestoration } from '@tanstack/router-core'
  import type { ScrollRestorationOptions } from '@tanstack/router-core'
  import { useRouter } from './useRouter.js'

  /** @deprecated use createRouter's `scrollRestoration` option instead */
  let _props: ScrollRestorationOptions = $props()

  setupScrollRestoration(useRouter(), true)

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      "The ScrollRestoration component is deprecated. Use createRouter's `scrollRestoration` option instead.",
    )
  }
</script>
