import { HYRequest } from './index'

export const getMusicBanner = (type: number = 0) => {
  return HYRequest.get({
    url: '/banner',
    data: {
      type
    }
  })
}
export const getPlaylistDetail = (id: number) => {
  return HYRequest.get({
    url: '/playlist/detail',
    data: {
      id
    }
  })
}

export const getSongMenuList = (cat:string = '全部', limit: number = 6, offset: number = 0) => {
  return HYRequest.get({
    url: '/top/playlist',
    data: {
      cat,
      limit,
      offset
    }
  })
}

export const getSongMenuTag = () => {
  return HYRequest.get({
    url: '/playlist/hot'
  })
}