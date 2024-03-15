import { consola } from 'consola'

export default defineEventHandler(async (event) => {
  consola.info('Hello world')

  return {
    message: 'hello world',
    event,
  }
})
