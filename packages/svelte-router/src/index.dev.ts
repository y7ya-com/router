// Development entry point — re-exports everything from index.ts but overrides
// HeadContent with the dev version that removes Vite's SSR-injected dev-styles
// links after hydration.
export * from './index.js'
export { default as HeadContent } from './HeadContent.dev.svelte'
