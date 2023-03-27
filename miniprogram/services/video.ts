import { HYRequest } from './index'

export const getTopMV = (offset: number = 0, limit: number = 20) => {
  return HYRequest.get({
    url: '/top/mv',
    data: {
      limit,
      offset
    }
  })
}
export const getMVUrl = (id: number) => {
  return HYRequest.get({
    url: '/mv/url',
    data: {
      id
    }
  })
}
export const getMVInfo = (mvid: number) => {
  return HYRequest.get({
    url: '/mv/detail',
    data: {
      mvid
    }
  })
}
export const getMVRecommend = (id: number) => {
  return HYRequest.get({
    url: '/related/allvideo',
    data: {
      id
    }
  })
}