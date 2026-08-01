import { RSBUILD_ENVIRONMENT_NAMES, tanStackStartRsbuild, } from '@tanstack/start-plugin-core/rsbuild';
import { svelteStartDefaultEntryPaths } from './shared.js';
export function tanstackStart(options) {
    const corePluginOpts = {
        framework: 'svelte',
        defaultEntryPaths: svelteStartDefaultEntryPaths,
        providerEnvironmentName: RSBUILD_ENVIRONMENT_NAMES.server,
        ssrIsProvider: true,
    };
    return tanStackStartRsbuild(corePluginOpts, options);
}
