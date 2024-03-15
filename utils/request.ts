import crypto from 'node:crypto'
import { URLSearchParams } from 'node:url'

import type { FetchOptions } from 'ofetch'

import * as encrypt from './crypto'
import { anonToken } from './token'

/**
 * 选择一个随机的 User-Agent
 */
function chooseUserAgent(ua: 'mobile' | 'pc' = 'mobile') {
  const userAgentList = {
    mobile: [
      // iOS 13.5.1 14.0 beta with safari
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.',
      // iOS with qq micromsg
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML like Gecko) Mobile/14A456 QQ/6.5.7.408 V1_IPH_SQ_6.5.7_1_APP_A Pixel/750 Core/UIWebView NetType/4G Mem/103',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.15(0x17000f27) NetType/WIFI Language/zh',
      // Android -> Huawei Xiaomi
      'Mozilla/5.0 (Linux; Android 9; PCT-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 HuaweiBrowser/10.0.3.311 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; U; Android 9; zh-cn; Redmi Note 8 Build/PKQ1.190616.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.5.22',
      // Android + qq micromsg
      'Mozilla/5.0 (Linux; Android 10; YAL-AL00 Build/HUAWEIYAL-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.62 XWEB/2581 MMWEBSDK/200801 Mobile Safari/537.36 MMWEBID/3027 MicroMessenger/7.0.18.1740(0x27001235) Process/toolsmp WeChat/arm64 NetType/WIFI Language/zh_CN ABI/arm64',
      'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BKK-AL10 Build/HONORBKK-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/10.6 Mobile Safari/537.36',
    ],
    pc: [
      // macOS 10.15.6  Firefox / Chrome / Safari
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
      // Windows 10 Firefox / Chrome / Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.30 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586',
      // Linux 就算了
    ],
  }

  const list = userAgentList[ua]
  return list[Math.floor(Math.random() * list.length)]
}

interface ReqOptions {
  ua: 'mobile' | 'pc'
  crypto: 'weapi' | 'linuxapi' | 'eapi' | 'api'
  ip: string
  cookie: Record<string, any> | string
}

type Options = Partial<ReqOptions> & FetchOptions

type Body = { code: number } & Record<string, any>
interface Answer {
  status: number
  cookie?: string
  data: Body
  message?: string
}

// eslint-disable-next-line antfu/top-level-function
export const createRequest = (
  url: string,
  options: Options,
) => new Promise<Answer>((resolve, reject) => {
  const headers = {
    'User-Agent': chooseUserAgent(options.ua),
    ...options.headers,
  } as Record<string, string>

  // 用于加密请求的参数
  let data = (options.body || {}) as Record<string, any>

  if (options.method === 'POST')
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  if (url.includes('music.163.com'))
    headers.Referer = 'https://music.163.com'

  const ip = options.ip || ''
  if (ip) {
    headers['X-Real-IP'] = ip
    headers['X-Forwarded-For'] = ip
  }

  // 设置 cookie
  if (typeof options.cookie === 'object') {
    options.cookie = {
      ...options.cookie,
      __remember_me: true,
      // NMTID: crypto.randomBytes(16).toString('hex'),
      _ntes_nuid: crypto.randomBytes(16).toString('hex'),
    }
    if (!url.includes('login'))
      options.cookie.NMTID = crypto.randomBytes(16).toString('hex')

    if (!options.cookie.MUSIC_U) {
      // 游客
      if (!options.cookie.MUSIC_A) {
        options.cookie.MUSIC_A = anonToken() // 游客 token
        options.cookie.os = options.cookie.os || 'ios'
        options.cookie.appver = options.cookie.appver || '8.20.21'
      }
    }
    headers.Cookie = Object.entries(options.cookie)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('; ')
  }
  else if (options.cookie) {
    headers.Cookie = options.cookie
  }
  else {
    headers.Cookie = '__remember_me=true; NMTID=xxx'
  }

  if (options.crypto === 'weapi') {
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69'

    const csrfToken = (headers.Cookie || '').match(/_csrf=([^(;|$)]+)/)
    data.csrf_token = csrfToken ? csrfToken[1] : ''
    data = encrypt.weapi(data)
    url = url.replace(/\w*api/, 'weapi')
  }
  else if (options.crypto === 'linuxapi') {
    data = encrypt.linuxapi({
      method: options.method,
      url: url.replace(/\w*api/, 'api'),
      params: data,
    })
    headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
    url = 'https://music.163.com/api/linux/forward'
  }
  else if (options.crypto === 'eapi') {
    const cookie = typeof options.cookie === 'object' ? options.cookie : {}
    const csrfToken = cookie.__csrf || ''
    const header = {
      osver: cookie.osver || '17,1,2', // 系统版本
      deviceId: cookie.deviceId, // encrypt.base64.encode(imei + '\t02:00:00:00:00:00\t5106025eb79a5247\t70ffbaac7')
      appver: cookie.appver || '8.9.70', // app版本
      versioncode: cookie.versioncode || '140', // 版本号
      mobilename: cookie.mobilename, // 设备model
      buildver: cookie.buildver || Date.now().toString().substr(0, 10),
      resolution: cookie.resolution || '1920x1080', // 设备分辨率
      __csrf: csrfToken,
      os: cookie.os || 'ios',
      channel: cookie.channel,
      requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(4, '0')}`,
    } as Record<string, string>

    if (cookie.MUSIC_U)
      header.MUSIC_U = cookie.MUSIC_U
    if (cookie.MUSIC_A)
      header.MUSIC_A = cookie.MUSIC_A
    headers.Cookie = Object.entries(header)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('; ')

    data.header = header
    data = encrypt.eapi(url, data)
    url = url.replace(/\w*api/, 'eapi')
  }

  if (options.crypto === 'eapi') {
    // settings.encoding = null
    // settings.responseType = 'arraybuffer'
  }

  // console.log('Request:', url, options, headers)

  const answer = {
    status: 200,
    data: { code: 200 },
  } as Answer

  $fetch<Body>(url, {
    ...options,
    method: (options.method as any).toUpperCase(),
    headers,
    body: new URLSearchParams(data).toString(),
    params: {
      ...options.params,
      csrf_token: data.csrf_token,
    },

    onRequestError({ error, response }) {
      throw createError({
        message: error.message,
        statusCode: response?.status,
      })
    },
    onResponseError({ error, response }) {
      throw createError({
        message: error?.message || 'Unknown error',
        statusCode: response?.status || 500,
      })
    },

    onResponse({ response }) {
      // console.log('Response: ', response._data)

      const cookies = response.headers.getSetCookie()
      if (cookies.length < 1)
        return

      answer.cookie = cookies.map(x =>
        x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
      ).join('; ')
      answer.status = response.status || 500

      const cookiesSet = {} as Record<string, string>
      cookies.forEach((c: string) => {
        const [ky, _] = c.split('; ')
        const [key, value] = ky.split('=')

        if (key === 'MUSIC_A')
          anonToken(value)

        cookiesSet[key] = value
      })

      answer.data.cookies = cookiesSet
    },
  }).then((body) => {
    if (typeof body === 'string') {
      if (options.crypto === 'eapi') {
        answer.data = {
          ...answer.data,
          ...JSON.parse(encrypt.decrypt(body)),
        }
      }
    }
    else {
      answer.data = {
        ...answer.data,
        ...body,
      }
    }

    // console.log('Answer:', answer, body)
    if (answer.status === 200)
      resolve(answer)
    else
      reject(answer)
  })
})
