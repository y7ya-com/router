<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { usersQueryOptions } from '~/utils/users'

  export const Route = createFileRoute('/users')({
    loader: async ({ context }) => {
      await context.queryClient.ensureQueryData(usersQueryOptions())
    },
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  const usersQuery = createQuery(() => usersQueryOptions())
  const users = $derived([
    ...(usersQuery.data ?? []),
    { id: 'i-do-not-exist', name: 'Non-existent User', email: '' },
  ])
</script>

<div class="p-2 flex gap-2">
  <ul class="list-disc pl-4">
    {#each users as user (user.id)}
      <li class="whitespace-nowrap">
        <Link
          to="/users/$userId"
          params={{
            userId: String(user.id),
          }}
          class="block py-1 text-blue-800 hover:text-blue-600"
          activeProps={{ class: 'text-black font-bold' }}
        >
          <div>{user.name}</div>
        </Link>
      </li>
    {/each}
  </ul>
  <hr />
  <Outlet />
</div>
