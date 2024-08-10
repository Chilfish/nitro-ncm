import CryptoJS from 'crypto-js'

const ID_XOR_KEY_1 = '3go8&$833h0k(2)2'

function cloudmusic_dll_encode_id(some_id: string) {
  let xoredString = ''
  for (let i = 0; i < some_id.length; i++) {
    const charCode
      = some_id.charCodeAt(i) ^ ID_XOR_KEY_1.charCodeAt(i % ID_XOR_KEY_1.length)
    xoredString += String.fromCharCode(charCode)
  }
  const wordArray = CryptoJS.enc.Utf8.parse(xoredString)
  const digest = CryptoJS.MD5(wordArray)
  return CryptoJS.enc.Base64.stringify(digest)
}

/**
 * 生成匿名账号
 */
export default defineEventHandler(async (event) => {
  // cookie.os = 'iOS'
  const deviceId = `NMUSIC`
  const encodedId = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(
      `${deviceId} ${cloudmusic_dll_encode_id(deviceId)}`,
    ),
  )
  const body = {
    username: encodedId,
  }

  const result = await createRequest(`https://music.163.com/api/register/anonimous`, {
    method: 'POST',
    body,
    crypto: 'weapi',
  })

  Object.entries<string>(result.data.cookies)
    .forEach(([key, value]) => {
      setCookie(event, key, value, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      })
    })

  return result
})
