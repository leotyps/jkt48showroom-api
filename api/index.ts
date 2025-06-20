// api/index.ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import pkg from '../package.json'
import api from '../src/routes'
import webhook from '../src/webhooks'
import { generateShowroomId } from '../src/utils/api/showroom'
import { ApiError } from '../src/utils/errorResponse'
import { FetchError } from 'ofetch'
import type { StatusCode } from 'hono/utils/http-status'

const app = new Hono()

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
  } else if (err instanceof FetchError) {
    return c.json({
      status: err.status,
      message: err.message,
      path,
    }, (err.status || 500) as StatusCode)
  }

  return c.json({
    status: 500,
    message: 'An error occurred!',
    path,
  }, 500)
})

generateShowroomId().catch(console.error)

export const config = {
  runtime: 'edge'
}

export default handle(app)
