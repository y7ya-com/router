import { redirect } from '@tanstack/svelte-router'
import { createServerFn } from '@tanstack/svelte-start'
import { setCookie } from '@tanstack/svelte-start/server'

export const setMultipleCookiesAndRedirect = createServerFn().handler(() => {
  // Set multiple cookies before redirecting
  // This tests that multiple Set-Cookie headers are preserved during redirect
  setCookie('session', 'session-value', { path: '/' })
  setCookie('csrf', 'csrf-token-value', { path: '/' })
  setCookie('theme', 'dark', { path: '/' })

  throw redirect({ to: '/multi-cookie-redirect/target' })
})
