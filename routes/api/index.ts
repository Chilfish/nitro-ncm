import {consola} from 'consola'

export default defineEventHandler((event) => {
  consola.info('Hello world')

  return {
    message: 'hello world',
    event,
  }
})
