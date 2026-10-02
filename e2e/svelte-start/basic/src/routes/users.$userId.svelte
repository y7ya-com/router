<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import axios from 'redaxios'
  import { getRouterInstance } from '@tanstack/svelte-start'
  import type { User } from '~/utils/users'
  import UserNotFound from '~/components/UserNotFound.svelte'
  import UserErrorComponent from '~/components/UserErrorComponent.svelte'

  export const Route = createFileRoute('/users/$userId')({
    loader: async ({ params: { userId } }) => {
      const router = await getRouterInstance()
      return await axios
        .get<User>('/api/users/' + userId, { baseURL: router.options.origin })
        .then((r) => r.data)
        .catch(() => {
          throw new Error('Failed to fetch user')
        })
    },
    errorComponent: UserErrorComponent,
    notFoundComponent: UserNotFound,
  })
</script>

<script lang="ts">
  const user = Route.useLoaderData()
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">{user.current.name}</h4>
  <div class="text-sm">{user.current.email}</div>
</div>
