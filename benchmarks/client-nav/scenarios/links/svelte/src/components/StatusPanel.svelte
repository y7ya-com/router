<script lang="ts">
  import { useMatchRoute } from '@tanstack/svelte-router'
  import { matchProbeIds } from '../../../shared'

  const matchRoute = useMatchRoute()
  const probes = matchProbeIds.map((id) => ({
    id,
    match: matchRoute({ to: '/items/$id', params: { id } }),
  }))
  // Static probes use the component-scoped matchRoute instead of
  // <MatchRoute>: every app uses useMatchRoute for cross-framework parity.
  const atHome = matchRoute({ to: '/' })
  const atAbout = matchRoute({ to: '/about' })
  const underRoot = matchRoute({ to: '/', fuzzy: true })
  const underAbout = matchRoute({ to: '/about', fuzzy: true })
  const aboutSearch = matchRoute({ to: '/about', includeSearch: true })
</script>

<aside>
  {#each probes as { id, match } (id)}
    <span>{match.current ? `on-${id}` : ''}</span>
  {/each}
  <span>{atHome.current ? 'at-home' : ''}</span>
  <span>{atAbout.current ? 'at-about' : ''}</span>
  <span>{underRoot.current ? 'under-root' : ''}</span>
  <span>{underAbout.current ? 'under-about' : ''}</span>
  <span>{aboutSearch.current ? 'about-search' : ''}</span>
</aside>
