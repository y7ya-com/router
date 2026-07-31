import { START_ENVIRONMENT_NAMES, tanStackStartVite, } from '@tanstack/start-plugin-core/vite';
import { svelteStartDefaultEntryPaths } from './shared';
export function tanstackStart(options) {
    const corePluginOpts = {
        framework: 'svelte',
        defaultEntryPaths: svelteStartDefaultEntryPaths,
        providerEnvironmentName: START_ENVIRONMENT_NAMES.server,
        ssrIsProvider: true,
        ssrResolverStrategy: {
            type: 'default',
        },
    };
    return [
        {
            name: 'tanstack-svelte-start:config',
            configEnvironment(environmentName, options) {
                return {
                    optimizeDeps: environmentName === START_ENVIRONMENT_NAMES.client ||
                        (environmentName === START_ENVIRONMENT_NAMES.server &&
                            options.optimizeDeps?.noDiscovery === false)
                        ? {
                            // As `@tanstack/svelte-start` depends on
                            // `@tanstack/svelte-router`, exclude both.
                            exclude: [
                                '@tanstack/svelte-start',
                                '@tanstack/svelte-router',
                                '@tanstack/start-static-server-functions',
                            ],
                        }
                        : undefined,
                };
            },
        },
        tanStackStartVite(corePluginOpts, options),
    ];
}
