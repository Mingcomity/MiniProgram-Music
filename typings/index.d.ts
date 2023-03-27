/// <reference path="./types/index.d.ts" />

interface MVInfo {
  artists: {
    id: number,
    name: string,
    imgUrl: string
  }[]
  name: string
  duration: number
  publishTime: string
}

interface MVRecommend {
  id: number
  artName: string
  duration: number
  title: string
  url: string
}
