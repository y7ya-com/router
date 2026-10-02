<script module lang="ts">
  import { createFileRoute, redirect } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'

  import { hashPassword, prismaClient } from '~/utils/prisma'
  import { useAppSession } from '~/utils/session'

  export const signupFn = createServerFn({
    method: 'POST',
  })
    .validator(
      (data: { email: string; password: string; redirectUrl?: string }) => data,
    )
    .handler(async ({ data: payload }) => {
      // Check if the user already exists
      const found = await prismaClient.user.findUnique({
        where: {
          email: payload.email,
        },
      })

      // Encrypt the password using Sha256 into plaintext
      const password = await hashPassword(payload.password)

      // Create a session
      const session = await useAppSession()

      if (found) {
        if (found.password !== password) {
          return {
            error: true,
            userExists: true,
            message: 'User already exists',
          }
        }

        // Store the user's email in the session
        await session.update({
          userEmail: found.email,
        })

        // Redirect to the prev page stored in the "redirect" search param
        throw redirect({
          href: payload.redirectUrl || '/',
        })
      }

      // Create the user
      const user = await prismaClient.user.create({
        data: {
          email: payload.email,
          password,
        },
      })

      // Store the user's email in the session
      await session.update({
        userEmail: user.email,
      })

      // Redirect to the prev page stored in the "redirect" search param
      throw redirect({
        href: payload.redirectUrl || '/',
      })
    })

  export const Route = createFileRoute('/signup')()
</script>

<script lang="ts">
  import { useServerFn } from '@tanstack/svelte-start'
  import { useMutation } from '~/hooks/useMutation.svelte'
  import Auth from '~/components/Auth.svelte'

  const signup = useServerFn(signupFn)

  const signupMutation = useMutation({
    fn: signup,
  })
</script>

<Auth
  actionText="Sign Up"
  status={signupMutation.status}
  onSubmit={(form) => {
    const formData = new FormData(form)

    signupMutation.mutate({
      data: {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      },
    })
  }}
>
  {#snippet afterSubmit()}
    {#if signupMutation.data?.error}
      <div class="text-red-400">
        {signupMutation.data?.message}
      </div>
    {/if}
  {/snippet}
</Auth>
