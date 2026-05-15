<script lang="ts">
  import { useParams } from '@tanstack/svelte-router'

  const params = useParams({ strict: false })

  const commentsByPost: Record<string, Array<{ author: string; body: string }>> = {
    '1': [
      { author: 'alice', body: 'Refreshing — no codegen step.' },
      { author: 'bob', body: 'Wait, so the file-based plugin is optional?' },
    ],
    '2': [
      { author: 'cara', body: 'Loaders + beforeLoad solved auth for us.' },
    ],
    '3': [
      { author: 'dev', body: 'Schema-validated search params is underrated.' },
      { author: 'eve', body: 'Used Zod, worked first try.' },
    ],
    '4': [
      { author: 'fox', body: 'Outlet ergonomics are nicer than what I had in mind.' },
    ],
    '5': [
      { author: 'gemma', body: 'The autocomplete on Link is the best part.' },
    ],
    '6': [
      { author: 'hans', body: 'Bundle stayed under 40 kB even with 50 routes.' },
    ],
  }

  const comments = $derived(commentsByPost[params.current?.postId as string] ?? [])
</script>

{#if comments.length}
  <ul>
    {#each comments as c}
      <li>
        <strong>{c.author}</strong>
        <p>{c.body}</p>
      </li>
    {/each}
  </ul>
{:else}
  <p class="empty">No comments.</p>
{/if}

<style>
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
  }
  li p {
    margin: 0.25rem 0 0;
    color: #374151;
  }
  .empty {
    color: #6b7280;
  }
</style>
