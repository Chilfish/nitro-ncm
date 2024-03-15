import path from 'node:path'

const root = path.resolve()

export default defineNitroConfig({
  routeRules: {
    '/**': { cors: true },
    '/': { redirect: '/api' },
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
