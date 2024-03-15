import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

export function anonToken(set?: string) {
  const tmpPath = tmpdir()
  const tokenPath = path.resolve(tmpPath, './NCM_ANONYMOUS_TOKEN')

  if (set) {
    fs.writeFileSync(tokenPath, set, 'utf-8')
    return set
  }

  try {
    return fs.readFileSync(tokenPath, 'utf-8')
  }
  catch (e) {
    return ''
  }
}
