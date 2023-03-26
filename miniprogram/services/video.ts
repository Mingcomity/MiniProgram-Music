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