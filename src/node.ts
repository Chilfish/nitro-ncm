import process from 'node:process'
import { serve } from '@hono/node-server'
import app from './app'

const port = Number(process.env.PORT || 3344)
const server = serve({
  fetch: app.fetch,
  port,
})

console.log(`Server running at http://localhost:${port}/api`)

export default server
