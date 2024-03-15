import path from 'node:path'

const root = path.resolve()

export default defineNitroConfig({
  routeRules: {
    '/': { redirect: '/api' },
    '/**': { cors: true, cache: { maxAge: 60 * 60 * 12 } },
    '/user/anon-token': { cache: { maxAge: 60 } },
  },

  imports: {
    dirs: [
    ],
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        paths: {
          '~/*': [path.join(root, './*')],
        },
      },
    },
  },

  // should return the json response manually
  errorHandler: '~/utils/error/nitroErrorHandler.ts',
})
