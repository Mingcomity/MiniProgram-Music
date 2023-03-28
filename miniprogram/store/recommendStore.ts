// @ts-ignore 
import { HYEventStore } from 'hy-event-store'
import { getPlaylistDetail } from '../services/music'
const recommendStore = new HYEventStore({
  state: {
    recommendSongInfo: {}
  },
  actions: {
    // 推荐歌曲网络请求
    fetchRecommendSongsAction(ctx: any) {
      getPlaylistDetail(3778678).then((res:any) => {
        ctx.recommendSongInfo = res.playlist
      })
    }
  }
})

export default recommendStore