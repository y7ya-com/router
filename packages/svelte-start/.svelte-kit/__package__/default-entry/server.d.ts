import type { Register } from '@tanstack/svelte-router';
import type { RequestHandler } from '@tanstack/svelte-start/server';
export type ServerEntry = {
    fetch: RequestHandler<Register>;
};
export declare function createServerEntry(entry: ServerEntry): ServerEntry;
declare const _default: ServerEntry;
export default _default;
