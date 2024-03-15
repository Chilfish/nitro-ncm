export default defineNitroConfig({
  routeRules: {
    '/**': { cors: true },
  },

  typescript: {
    strict: true,
  },

  // should return the json response manually
  errorHandler: './utils/error/nitroErrorHandler.ts',
})
