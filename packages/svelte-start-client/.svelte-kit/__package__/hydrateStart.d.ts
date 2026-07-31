import type { AnyRouter } from '@tanstack/router-core';
/**
 * Svelte-specific wrapper for hydrateStart. The hydration-complete signal
 * (`window.$_TSR.h()`) is emitted by `StartClient` after Svelte finishes
 * hydrating — not here — so stream cleanup can't run before the component
 * tree exists (same ordering as vue-start-client).
 */
export declare function hydrateStart(): Promise<AnyRouter>;
