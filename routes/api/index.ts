import { consola } from 'consola'

export default defineEventHandler(async (event) => {
  return {
    message: 'hello world',
    event,
    cookie: getToken(event),
  }
})
