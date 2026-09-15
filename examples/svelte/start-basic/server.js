// Production server: serves the client build statically and hands every other
// request to the Start server entry. `pnpm build` first, then `pnpm start`.
import path from 'node:path'
import express from 'express'
import { toNodeHandler } from 'srvx/node'

const port = Number(process.env.PORT ?? 3000)
const server = (await import(path.resolve('dist/server/server.js'))).default

const app = express()
app.use(express.static(path.resolve('dist/client')))
app.use(toNodeHandler(server.fetch))
app.listen(port, () => console.info(`http://localhost:${port}`))
