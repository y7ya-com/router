<script lang="ts">
  import { useTags } from './headContentUtils'

  const tagsSel = useTags()
</script>

<svelte:head>
  {#each tagsSel.current as tag}
    {#if tag.tag === 'title'}
      <title>{tag.children}</title>
    {:else if tag.tag === 'meta'}
      <meta {...tag.attrs} />
    {:else if tag.tag === 'link'}
      <link {...tag.attrs} />
    {:else if tag.tag === 'style'}
      <style {...tag.attrs}>{@html tag.children ?? ''}</style>
    {:else if tag.tag === 'script'}
      <script {...tag.attrs}>{@html tag.children ?? ''}</script>
    {/if}
  {/each}
</svelte:head>
