import path from 'node:path'
import express from 'express'
import getPort, { portNumbers } from 'get-port'

const isProd = process.env.NODE_ENV === 'production'

export async function createServer(root = process.cwd()) {
  const app = express()

  /** @type {import('vite').ViteDevServer | undefined} */
  let vite
  if (!isProd) {
    vite = await (
      await import('vite')
    ).createServer({
      root,
      logLevel: 'info',
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)
  } else {
    app.use((await import('compression')).default())
    app.use(express.static('./dist/client'))
  }

  app.use('/{*splat}', async (req, res) => {
    try {
      const url = req.originalUrl

      if (path.extname(url) !== '') {
        res.status(404).end(`${url} is not a router path`)
        return
      }

      // Pull vite's dev <head> (HMR client preamble) so HMR works in dev.
      let viteHead = !isProd
        ? await vite.transformIndexHtml(
            url,
            `<html><head></head><body></body></html>`,
          )
        : ''
      viteHead = viteHead.substring(
        viteHead.indexOf('<head>') + 6,
        viteHead.indexOf('</head>'),
      )

      const entry = !isProd
        ? await vite.ssrLoadModule('/src/entry-server.ts')
        : await import('./dist/server/entry-server.js')

      await entry.render({ req, res, head: viteHead })
    } catch (e) {
      vite?.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

createServer().then(async ({ app }) =>
  app.listen(await getPort({ port: portNumbers(3000, 3100) }), () => {
    console.info('SSR server: http://localhost:3000')
  }),
)
