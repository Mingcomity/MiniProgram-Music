import { getMVUrl, getMVInfo, getMVRecommend } from '../../services/video'
Page({
  data: {
    MVUrl: <string>'',
    id: <number>0,
    MVInfo: <MVInfo>{
      artists: [
      ],
      name: '',
      duration: 0,
      publishTime: ''
    },
    MVRecommend: <MVRecommend[]>[]
  },
  onLoad(options:any) {
    // 获取id
    const id = options.id
    this.setData({
      id
    })
    this.fetchMVUrl()
    this.fetchMVInfo()
    this.fetchMVRecommend()
  },
  // 请求视频播放链接
  async fetchMVUrl() {
    const res:any = await getMVUrl(this.data.id)
    this.setData({
      MVUrl: res.data.url
    })
  },
  // 请求视频详情
  async fetchMVInfo() {
    const res:any = await getMVInfo(this.data.id)
    const artists = res.data.artists.map((val:any) => {
      const {name, img1v1Url:imgUrl, id} = val
      return {
        id,
        name,
        imgUrl
      }
    })
    const {name, duration, publishTime} = res.data
    this.setData({
      MVInfo: {
        name, 
        duration, 
        publishTime,
        artists
      }
    })
  },
  // 请求推荐视频
  async fetchMVRecommend() {
    const res:any = await getMVRecommend(this.data.id)
    const arr = res.data.map((val:any) => {
      const artName = val.creator[0].userName
      const {title, vid: id, durationms: duration,coverUrl:url} = val
      return {
        title,
        id,
        duration,
        artName,
        url
      }
    })
    this.setData({
      MVRecommend: arr
    })
  }
})