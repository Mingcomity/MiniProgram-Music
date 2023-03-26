import { getTopMV } from '../../services/video'

Page({
  data: {
    videoList: <any[]>[],
    offset: <number>0,
    hasMore: <boolean>true
  },
  onLoad() {
    this.fetchTopMV()
  },
  // 发送网络请求的方法
  async fetchTopMV() {
    // 发送网络请求
    const res:any = await getTopMV(this.data.offset);
    this.setData({
      videoList: [...this.data.videoList,...res.data]
    })
    this.data.offset = this.data.videoList.length
    this.data.hasMore = res.hasMore
  },
  // 上拉加载过多
  onReachBottom() {
    // 判断是否有更多的数据
    if(!this.data.hasMore) return
    this.fetchTopMV()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    // 1.清空数据
    this.setData({
      videoList: []
    })
    this.data.offset = 0
    this.data.hasMore = true
    // 重新请求数据
    await this.fetchTopMV()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  },

  // 事件监听
  onVideoItemTap(event:any) {
    const item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `../detail-video/detail-video?id=${item.id}`
    })
  }
})