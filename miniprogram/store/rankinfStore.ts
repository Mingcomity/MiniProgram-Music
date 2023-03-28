// @ts-ignore 
import { HYEventStore } from 'hy-event-store'
import { getPlaylistDetail } from '../services/music'

const rankingsIdsMap:any = {
  newRanking: 3779629,
  originRanking: 2884035,
  upRanking: 19723756
}

const rankingStore = new HYEventStore({
  state: {
    newRanking: {},
    originRanking: {},
    upRanking: {}
  },
  actions: {
    fetchRankingDataAction(ctx:any) {
      for(const key in rankingsIdsMap) {
        const id = rankingsIdsMap[key]
        getPlaylistDetail(id).then((res: any) => {
          ctx[key] = res.playlist
        } )
      }
    }
  }
})

export default rankingStore