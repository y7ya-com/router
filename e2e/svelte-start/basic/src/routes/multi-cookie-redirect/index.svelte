<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { setMultipleCookiesAndRedirect } from '~/utils/multiCookieRedirect'

  export const Route = createFileRoute('/multi-cookie-redirect/')({
    loader: () => setMultipleCookiesAndRedirect(),
  })
</script>

<div></div>
