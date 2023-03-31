import { HYRequest } from './index'
export const getSearchHot = () => {
  return HYRequest.get({
    url: "/search/hot"
  })
}

export const getSearchSuggest = (keywords:any) => {
  return HYRequest.get({
    url: "/search/suggest",
    data: {
      keywords,
      type: "mobile"
    }
  })
}

export const getSearchResult = (keywords:any) => {
  return HYRequest.get({
    url: "/search",
    data: {
      keywords
    }
  })
}