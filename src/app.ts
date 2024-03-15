import { Hono } from 'hono'
import { add } from './utils'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: `Hello, world! ${add(1, 2)}`,
  })
})

export default app
