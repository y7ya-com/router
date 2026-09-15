import {
  RSBUILD_ENVIRONMENT_NAMES,
  tanStackStartRsbuild,
} from '@tanstack/start-plugin-core/rsbuild'
import { svelteStartDefaultEntryPaths } from './shared.js'
import type {
  TanStackStartRsbuildInputConfig,
  TanStackStartRsbuildPluginCoreOptions,
} from '@tanstack/start-plugin-core/rsbuild'
import type { RsbuildPlugin } from '@rsbuild/core'

export function tanstackStart(
  options?: TanStackStartRsbuildInputConfig,
): RsbuildPlugin {
  const corePluginOpts: TanStackStartRsbuildPluginCoreOptions = {
    framework: 'svelte',
    defaultEntryPaths: svelteStartDefaultEntryPaths,
    providerEnvironmentName: RSBUILD_ENVIRONMENT_NAMES.server,
    ssrIsProvider: true,
  }

  const corePlugin = tanStackStartRsbuild(corePluginOpts, options)

  return {
    ...corePlugin,
    async setup(api) {
      await corePlugin.setup(api)

      // `@rsbuild/plugin-svelte` compiles for the browser in every
      // environment; the server environment needs server output.
      api.modifyBundlerChain({
        order: 'post',
        handler: (chain, { CHAIN_ID, environment }) => {
          if (environment.name !== RSBUILD_ENVIRONMENT_NAMES.server) {
            return
          }
          for (const rule of chain.module.rules.values()) {
            const use = rule.uses.get(CHAIN_ID.USE.SVELTE)
            if (use) {
              use.tap((loaderOptions) => {
                const svelteOptions = loaderOptions as Record<string, any>
                return {
                  ...svelteOptions,
                  compilerOptions: {
                    ...svelteOptions.compilerOptions,
                    generate: 'server',
                  },
                }
              })
            }
          }
        },
      })
    },
  }
}
