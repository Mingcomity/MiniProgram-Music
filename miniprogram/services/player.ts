import { HYRequest } from './index'

export const getSongDetail = (ids: number) => {
  return HYRequest.get({
    url:'/song/detail',
    data: {
      ids
    }
  })
}
export const getSongLyric = (id: number) => {
  return HYRequest.get({
    url:'/lyric',
    data: {
      id
    }
  })
}