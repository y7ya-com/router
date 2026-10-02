<script lang="ts">
  import { useRouter } from '@tanstack/svelte-router'
  import { useServerFn } from '@tanstack/svelte-start'
  import { useMutation } from '../hooks/useMutation.svelte'
  import { loginFn } from '../routes/_authed.svelte'
  import Auth from './Auth.svelte'
  import { signupFn } from '~/routes/signup.svelte'

  const router = useRouter()
  const login = useServerFn(loginFn)
  const signup = useServerFn(signupFn)

  const loginMutation = useMutation({
    fn: login,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate()
        router.navigate({ to: '/' })
        return
      }
    },
  })

  const signupMutation = useMutation({
    fn: signup,
  })
</script>

<Auth
  actionText="Login"
  status={loginMutation.status}
  onSubmit={(form) => {
    const formData = new FormData(form)

    loginMutation.mutate({
      data: {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      },
    })
  }}
>
  {#snippet afterSubmit()}
    {#if loginMutation.data}
      <div class="text-red-400">
        {loginMutation.data?.message}
      </div>
      {#if loginMutation.data?.userNotFound}
        <div>
          <button
            class="text-blue-500"
            onclick={(e) => {
              const formData = new FormData(
                (e.target as HTMLButtonElement).form!,
              )

              signupMutation.mutate({
                data: {
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                },
              })
            }}
            type="button"
          >
            Sign up instead?
          </button>
        </div>
      {/if}
    {/if}
  {/snippet}
</Auth>
