import { Hono } from 'hono'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: `Hello, world! ${add(11, 2)}`,
  })
})

export default app
