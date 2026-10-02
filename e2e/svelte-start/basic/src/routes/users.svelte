<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { getRouterInstance } from '@tanstack/svelte-start'
  import axios from 'redaxios'
  import type { User } from '~/utils/users'

  export const Route = createFileRoute('/users')({
    loader: async () => {
      const router = await getRouterInstance()
      return await axios
        .get<Array<User>>('/api/users', { baseURL: router.options.origin })
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch users')
        })
    },
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const users = Route.useLoaderData()
</script>

<div class="p-2 flex gap-2">
  <ul class="list-disc pl-4">
    {#each [...users.current, { id: 'i-do-not-exist', name: 'Non-existent User', email: '' }] as user (user.id)}
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
