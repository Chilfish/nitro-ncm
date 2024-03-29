/**
 * 根据歌单 id 获取歌单内所有歌曲
 * 参数：
 */
export default defineEventHandler(async (event) => {
  const query = getQuery<{
    id: string
    limit?: string
    offset?: string
    s?: string
  }>(event)

  const limit = Number(query.limit) || Number.POSITIVE_INFINITY
  const offset = Number(query.offset) || 0
  const cookie = getToken(event)

  const result = await createRequest(`https://music.163.com/api/v6/playlist/detail`, {
    method: 'POST',
    crypto: 'api',
    cookie,
    body: {
      id: query.id,
      n: 100000,
      s: query.s || 8,
    },
  })

  if (!result.data.playlist) {
    return createError({
      message: `[获取歌单列表] ${result.data.message}`,
      statusCode: result.data.code || 404,
    })
  }

  const trackIds = result.data.playlist.trackIds
  const idsData = {
    c: `[${trackIds
          .slice(offset, offset + limit)
          .map((item: any) => `{"id":${item.id}}`)
          .join(',')
        }]`,
  }

  const res = await createRequest(`https://music.163.com/api/v3/song/detail`, {
    method: 'POST',
    crypto: 'weapi',
    cookie,
    body: idsData,
  })

  if (!res.data.songs) {
    return createError({
      message: `[获取歌单列表] ${result.data.message}`,
      statusCode: res.data.code || 404,
    })
  }

  return {
    ...res,
    data: {
      code: res.data.code,
      songs: res.data.songs,
    },
  }
})
