import 'dotenv/config'
import { Hono } from 'hono'
import { FetchError } from 'ofetch'
import type { StatusCode } from 'hono/utils/http-status'
import pkg from '../package.json'
import { ApiError } from './utils/errorResponse'
import api from './routes'
import webhook from './webhooks'
import { generateShowroomId } from './utils/api/showroom'

const app = new Hono()

if (!process.env.SECRET) throw new Error('No Secret Environtment!')
if (!process.env.AUTH_SECRET) throw new Error('No Auth Secret Environtment!')
if (!process.env.SHOWROOM_API) throw new Error('Showroom API not provided!')

app.get('/', c => c.json({
  author: 'crstlnz',
  website: 'https://dc.crstlnz.my.id',
  version: `${pkg.version}`,
}))

app.route('/api', api)
app.route('/webhook', webhook)

app.notFound((c) => {
  return c.json({
    status: 404,
    message: 'Endpoint not found!',
    path: c.req.path,
  }, 404)
})

app.onError((err, c) => {
  console.error(err)
  const path = c.req.path
  if (err instanceof ApiError) {
    const errJson = err.toJSON()
    return c.json({
      ...errJson,
      path,
    }, (errJson.status || 500) as StatusCode)
  }
  else if (err instanceof FetchError) {
    return c.json({
      status: (err as FetchError).status,
      message: (err as FetchError).message,
      path,
    }, ((err as FetchError).status || 500) as StatusCode)
  }

  return c.json({
    status: 500,
    message: 'An error occurred!',
    path,
  }, 500)
})

generateShowroomId().catch(console.error)

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

// ✅ Vercel-compatible edge handler
import { handle } from 'hono/vercel'
export const config = {
  runtime: 'edge'
}
export default handle(app)
