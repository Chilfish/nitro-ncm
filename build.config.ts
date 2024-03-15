import type { BuildHooks } from 'unbuild'
import { defineBuildConfig } from 'unbuild'
import AutoImport from 'unplugin-auto-import/rollup'
import typescript from '@rollup/plugin-typescript'

const hooks: Partial<BuildHooks> = {
  'rollup:options': function (_ctx, options) {
    options.plugins = [
      typescript({
        tsconfig: 'tsconfig.json',
        sourceMap: false,
        inlineSources: false,
      }),
      AutoImport({
        dirs: ['src', 'src/utils', 'src/routes'],
        dts: 'src/types/auto-imports.d.ts',
      }),
    ]
  },
}

export default defineBuildConfig([
  {
    entries: ['./src/index.ts'],
    failOnWarn: false,
    rollup: {
      output: {
        dir: 'dist',
        format: 'cjs',
      },
    },
    hooks,
  },
  {
    entries: ['./src/node.ts'],
    failOnWarn: false,
    hooks: {
      ...hooks,
      'build:done': function (_ctx) {
        console.log('Build done!')
        process.exit(0)
      },
    },
  },
])
