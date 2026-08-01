import { START_ENVIRONMENT_NAMES, tanStackStartVite, } from '@tanstack/start-plugin-core/vite';
import { svelteStartDefaultEntryPaths } from './shared.js';
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
            // vite-plugin-svelte auto-externalizes the *dependencies* of every
            // svelte library it detects — which puts @tanstack/start-server-core on
            // ssr.resolve.external. Explicit external beats noExternal, so in dev
            // the package is loaded by real Node and its `#tanstack-router-entry`
            // import dies (that specifier only exists as a Vite alias). Strip the
            // start packages back off the explicit-external list.
            configResolved(config) {
                for (const env of Object.values(config.environments ?? {})) {
                    const ext = env.resolve?.external;
                    if (Array.isArray(ext)) {
                        const keep = ext.filter((e) => typeof e !== 'string' ||
                            !/^@tanstack\/(start-|svelte-start|svelte-router)/.test(e));
                        ext.length = 0;
                        ext.push(...keep);
                    }
                }
            },
            configEnvironment(environmentName, options) {
                return {
                    resolve: environmentName === START_ENVIRONMENT_NAMES.server
                        ? {
                            // The `#tanstack-router-entry` / `#tanstack-start-entry`
                            // specifiers are resolved by a Vite alias (start-plugin-core
                            // planning.ts). If these packages are externalized in dev
                            // SSR, real Node resolves their imports instead and dies on
                            // ERR_PACKAGE_IMPORT_NOT_DEFINED. Environment-level
                            // `resolve.noExternal` is what the environments API honours.
                            noExternal: [
                                '@tanstack/svelte-start',
                                '@tanstack/svelte-start-client',
                                '@tanstack/svelte-start-server',
                                '@tanstack/svelte-router',
                                '@tanstack/start-server-core',
                                '@tanstack/start-client-core',
                            ],
                        }
                        : undefined,
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
                                '@tanstack/start-client-core',
                                '@tanstack/start-storage-context',
                            ],
                            // The excluded packages are served raw and import these at
                            // BROWSER time; without pre-including them, vite discovers
                            // them mid-page-load, re-optimizes, and the page mixes two
                            // prebundle generations — two svelte runtimes, and
                            // getContext dies with lifecycle_outside_component.
                            // Browser-safe leaves only. start-client-core must NOT be
                            // prebundled: it reaches @tanstack/start-storage-context,
                            // whose unconditional `node:async_hooks` import becomes
                            // vite's browser-external stub in a prebundle and throws
                            // "AsyncLocalStorage is not a constructor" at import time.
                            include: [
                                '@tanstack/router-core',
                                '@tanstack/router-core/isServer',
                                '@tanstack/router-core/ssr/client',
                                '@tanstack/history',
                                '@tanstack/store',
                                '@tanstack/svelte-store',
                                'devalue',
                                'isbot',
                            ],
                        }
                        : undefined,
                };
            },
        },
        tanStackStartVite(corePluginOpts, options),
    ];
}
