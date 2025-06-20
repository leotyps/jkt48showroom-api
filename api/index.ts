import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'It works!' })
})

export const config = {
  runtime: 'edge'
}

export default handle(app)
