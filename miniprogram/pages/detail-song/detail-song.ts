import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankinfStore"
import { getPlaylistDetail } from '../../services/music'
import playerStore from "../../store/playerStore"

Page({
  data:{
    type: "ranking",
    key: 'newRanking',
    songInfo:<any>{},
    id: 0
  },
  onLoad(options:any) {
    // 确定获取数据的类型
    // type: ranking -> 榜单
    // type: recommend -> 推荐数据
    // type: menu -> 歌单详情
    const type = options.type
    this.setData({
      type
    })
    if ( type === "ranking" ) {
      const key = options.key
      this.data.key = key
      rankingStore.onState(key, this.handleRanking)
    } else if( type === "recommend") {
      recommendStore.onState("recommendSongInfo", this.handleRanking)
    } else if( type === "menu") {
      const id = options.id
      this.data.id = id
      this.fetchMenuSongInfo()
    }
  },
  onUnload() {
    // 查询数据
    if(this.data.type === "ranking" ) {
      rankingStore.offState(this.data.key, this.handleRanking)
    } else if( this.data.type === "recommend") {
      recommendStore.offState("recommendSongInfo", this.handleRanking)
    }
  },
  onSongItemTap(event:any) {
    playerStore.setState("playSongList", this.data.songInfo.tracks)
    playerStore.setState("playSongIndex",event.currentTarget.dataset.index)
  },
  // 修改data中的数据，用于榜单的获取
  handleRanking(value:any) {
    if(this.data.type === "recommend" ) {
      value.name = "推荐歌曲"
    }
   this.setData({songInfo: value})
    wx.setNavigationBarTitle({
     title: value.name
    })
  },
  // 发送网络请求，用于歌单详情的获取
  async fetchMenuSongInfo() {
    const res: any = await getPlaylistDetail(this.data.id)
    this.setData({
      songInfo: res.playlist
    })
  }
})