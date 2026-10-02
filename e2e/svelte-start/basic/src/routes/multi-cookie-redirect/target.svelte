<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/multi-cookie-redirect/target')({})
</script>

<script lang="ts">
  import Cookies from 'js-cookie'
  import { onMount } from 'svelte'

  let cookies = $state<Record<string, string>>({})

  onMount(() => {
    cookies = {
      session: Cookies.get('session') || '',
      csrf: Cookies.get('csrf') || '',
      theme: Cookies.get('theme') || '',
    }
  })
</script>

<div>
  <h1 data-testid="multi-cookie-redirect-target">
    Multi Cookie Redirect Target
  </h1>
  <div>
    <p>
      Session cookie:{' '}
      <span data-testid="cookie-session">{cookies.session}</span>
    </p>
    <p>
      CSRF cookie:{' '}
      <span data-testid="cookie-csrf">{cookies.csrf}</span>
    </p>
    <p>
      Theme cookie:{' '}
      <span data-testid="cookie-theme">{cookies.theme}</span>
    </p>
  </div>
</div>
