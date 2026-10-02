<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<script lang="ts">
  import { Link, linkOptions } from '@tanstack/svelte-router'

  const optionsList = [
    linkOptions({ to: '/normal-page' }),
    linkOptions({ to: '/with-loader' }),
    linkOptions({ to: '/with-search', search: { where: 'footer' } }),
  ] as const
</script>

<div class="p-2 grid gap-2">
  <h3>Welcome Home!</h3>
  <p>
    The are the links to be tested when navigating away from the index page.
    Otherwise known as NOT first-load tests, rather known as navigation tests.
  </p>
  {#each optionsList as options, i (i)}
    <div class="border p-2">
      <h4>{options.to} tests</h4>
      <p>
        <Link {...options} hash="at-the-bottom">
          {options.to}#at-the-bottom
        </Link>
      </p>
    </div>
  {/each}
</div>
