import { createStartHandler, defaultStreamHandler, } from '@tanstack/svelte-start/server';
const fetch = createStartHandler(defaultStreamHandler);
export function createServerEntry(entry) {
    return {
        async fetch(...args) {
            return await entry.fetch(...args);
        },
    };
}
export default createServerEntry({ fetch });
