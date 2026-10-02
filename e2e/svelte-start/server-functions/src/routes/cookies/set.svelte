<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    cookieSchema,
    setCookieServerFn1,
    setCookieServerFn2,
  } from './-functions/set'

  export const Route = createFileRoute('/cookies/set')({
    validateSearch: cookieSchema,
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => {
      await setCookieServerFn1({ data: deps })
      await setCookieServerFn2({ data: deps })
    },
  })
</script>

<script lang="ts">
  import Cookies from 'js-cookie'

  const search = Route.useSearch()
  let cookiesFromDocument = $state<Record<string, string | undefined>>({})

  const updateCookies = (value: string) => {
    const tempCookies: Record<string, string | undefined> = {}
    for (let i = 1; i <= 4; i++) {
      const key = `cookie-${i}-${value}`
      tempCookies[key] = Cookies.get(key)
    }
    cookiesFromDocument = tempCookies
  }

  $effect.pre(() => {
    updateCookies(search.current.value)
  })
</script>

<div>
  <h1 class="text-xl">cookies result</h1>
  <table>
    <tbody>
      <tr>
        <td>cookie</td>
        <td>value</td>
      </tr>
      {#each Object.entries(cookiesFromDocument) as [key, value] (key)}
        <tr>
          <td>{key}</td>
          <td data-testid={key}>{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
