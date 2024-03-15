import type { NitroErrorHandler } from 'nitropack'
import { myErrorHandler } from './errorHandler'

export default <NitroErrorHandler> async function (error, event) {
  const err = await myErrorHandler(error)

  const res = event.node.res
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = err.statusCode

  res.end(JSON.stringify(err.cause))
}
