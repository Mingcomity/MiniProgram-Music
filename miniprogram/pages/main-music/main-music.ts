import { getMusicBanner, getSongMenuList } from '../../services/music'
import {querySelect} from '../../utils/query-select'
import recommendStore from '../../store/recommendStore'
import rankingStore from '../../store/rankinfStore'
import playerStore from '../../store/playerStore'
import { throttle } from 'underscore'
const querySelectThrottle = throttle(querySelect, 100, { trailing: false})

Page({
  data: {
    searchValue: '',
    banners: [],
    bannerHeight: 0,
    screenWidth: 375,
    // 推荐歌曲
    recommendSongs: [],
    // 歌单
    hotMenuList: [],
    recMenuList: [],
    // 榜单数据
    isRankingData: false,
    rankingInfos: {},
    // 正在播放的歌曲信息:
    currentSong: {},
    isPlaying: false,
    // 播放列表
    show: false,
    // 当前的歌曲列表
    playSongList: [],
  },
  onLoad() {
    // 轮播图
    this.fetchMusicBanner()
    // 热门歌单
    this.fetchSongMenuList()
    // 监听推荐歌曲变化
    recommendStore.onState("recommendSongInfo",this.handleRecommendSongs)
    // 发起action
    recommendStore.dispatch("fetchRecommendSongsAction")
    rankingStore.onState("newRanking",this.getRankingHanlder("newRanking"))
    rankingStore.onState("originRanking",this.getRankingHanlder("originRanking"))
    rankingStore.onState("upRanking",this.getRankingHanlder("upRanking"))
    rankingStore.dispatch("fetchRankingDataAction")
    // 获取播放栏的数据
    playerStore.onStates(["currentSong",'isPlaying'], this.handlePlayInfos)
    // 获取当前播放列表的数据
    playerStore.onState("playSongList",this.handlGetSongLists)
  },
  onUnload() {
    recommendStore.offState("recommendSongInfo",this.handleRecommendSongs)
    rankingStore.offState("newRanking",this.getRankingHanlder("newRanking"))
    rankingStore.offState("originRanking",this.getRankingHanlder("originRanking"))
    rankingStore.offState("upRanking",this.getRankingHanlder("upRanking"))
    playerStore.offStates(["currentSong",'isPlaying'], this.handlePlayInfos)
    playerStore.offState("playSongList",this.handlGetSongLists)
  },
  // 监听点击搜索框
  onSearchClick() {
    wx.navigateTo({url: '../detail-search/detail-search'})
  },
  // 获取轮播图高度
  onBannerImageLoad() {
    // 获取image组件高度
    querySelectThrottle('.banner-image').then((height) => {
      this.setData({
        bannerHeight: height as number
      })
    })
  },
  // 监听点击更多
  onRecommendMoreClick() {
    wx.navigateTo({
      url: '../detail-song/detail-song?type=recommend'
    })
  },
  // 监听点击歌曲
  onSongItemTap(event:any) {
    playerStore.setState("playSongList", this.data.recommendSongs)
    playerStore.setState("playSongIndex",event.currentTarget.dataset.index)
  },
  // 暂停歌曲
  onPlayerPauseBtnTap() {
    playerStore.dispatch("playMusicStatusAction")
  },
  // 点击当前音乐，进行跳转
  onPlayBarAlbumTap() {
    wx.navigateTo({
      url: '../music-player/music-player'
    })
  },
  // 弹出当前歌曲列表
  onShowTap() {
    this.setData({ show: true });
  },
  // 关闭单曲歌曲列表
  onClose() {
    this.setData({ show: false });
  },
  // 请求轮播图
  async fetchMusicBanner() {
    const res:any = await getMusicBanner()
    this.setData({ banners: res.banners})
  },
  // 获取歌单
  async fetchSongMenuList() {
    const res: any = await Promise.all([getSongMenuList(),getSongMenuList('华语')])
    this.setData({
      hotMenuList: res[0].playlists,
      recMenuList: res[1].playlists
    })
  },
  // 从store上获取数据
  handleRecommendSongs(value: any) {
    if(!value.tracks) return
      this.setData({
        recommendSongs: value.tracks.slice(0, 6)
      })
  },
  handlePlayInfos({ currentSong,isPlaying}:any) {
    if(currentSong) {
      this.setData({
        currentSong
      })
    }
    if(isPlaying !== undefined) {
      this.setData({
        isPlaying
      })
    }
  },
  handlGetSongLists(value: any) {
    console.log(value);
    this.setData({
      playSongList: value
    })
  },
  getRankingHanlder(ranking: string) {
    return (value:any) => {
      if(!value.name) return
      this.setData({
        isRankingData: true
      })
      const newRankingInfo = {...this.data.rankingInfos, [ranking]: value}
      this.setData({
        rankingInfos: newRankingInfo
      })
    }
  }
})