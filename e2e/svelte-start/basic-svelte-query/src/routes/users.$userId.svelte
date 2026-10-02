<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import UserErrorComponent from '~/components/UserErrorComponent.svelte'
  import UserNotFound from '~/components/UserNotFound.svelte'
  import { userQueryOptions } from '~/utils/users'

  export const Route = createFileRoute('/users/$userId')({
    loader: async ({ context, params: { userId } }) => {
      await context.queryClient.ensureQueryData(userQueryOptions(userId))
    },
    errorComponent: UserErrorComponent,
    notFoundComponent: UserNotFound,
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const params = Route.useParams()
  const userQuery = createQuery(() =>
    userQueryOptions(params.current?.userId ?? ''),
  )
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">
    {userQuery.data?.name ?? 'loading...'}
  </h4>
  <div class="text-sm">{userQuery.data?.email ?? ''}</div>
</div>
