export default defineEventHandler(async (event) => {
  const query = getQuery<{
    uid: string
    type?: 1 | 0 // 1: 最近一周, 0: 所有时间
  }>(event)

  const cookie = getToken(event)

  return createRequest(`https://music.163.com/weapi/v1/play/record`, {
    method: 'POST',
    crypto: 'weapi',
    cookie,
    body: {
      uid: query.uid,
      type: query.type || 0,
    },
  })
})
