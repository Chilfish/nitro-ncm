import { copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const root = resolve()

execSync('pnpm unbuild', { stdio: 'inherit' })

copyFileSync(
  join(root, 'dist', 'index.mjs'),
  join(root, 'api', 'index.cjs'),
)
