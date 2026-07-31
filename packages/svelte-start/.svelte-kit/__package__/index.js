export { useServerFn } from './useServerFn';
export * from '@tanstack/start-client-core';
// Explicit re-exports shadow `export *` above so these public-API names are
// registered on the namespace at link time (via Vite SSR's `defineExport`
// at fileStartIndex), surviving the cold-start SSR cycle through user
// middleware. See vitejs/vite#22491 / #22493 — mirrors vue-start.
export { createClientOnlyFn, createCsrfMiddleware, createIsomorphicFn, createMiddleware, createServerFn, createServerOnlyFn, createStart, } from '@tanstack/start-client-core';
