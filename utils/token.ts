import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import type { EventHandlerRequest, H3Event } from 'h3'

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

export function getToken(event: H3Event<EventHandlerRequest>) {
  const envCookie = process.env.NCM_COOKIE
  if (envCookie)
    return envCookie

  const ctxCookie = parseCookies(event)
  if (ctxCookie)
    return ctxCookie

  return anonToken()
}
