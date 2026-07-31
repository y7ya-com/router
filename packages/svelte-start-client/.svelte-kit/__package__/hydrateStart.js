import { hydrateStart as coreHydrateStart } from '@tanstack/start-client-core/client';
/**
 * Svelte-specific wrapper for hydrateStart. The hydration-complete signal
 * (`window.$_TSR.h()`) is emitted by `StartClient` after Svelte finishes
 * hydrating — not here — so stream cleanup can't run before the component
 * tree exists (same ordering as vue-start-client).
 */
export async function hydrateStart() {
    return await coreHydrateStart();
}
