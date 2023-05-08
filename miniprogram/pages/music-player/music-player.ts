import { throttle } from 'underscore'
import playerStore, {audioContext} from '../../store/playerStore'

// 创建播放器

const app = getApp()
Page({
  data: {
    pageTitles: [
      {
        name: '歌曲',
        index: 0
      },
      {
        name: '歌词',
        index: 1
      }
    ],

    stateKeys: [ "id", "currentSong", "currentTime", "durationTime", "lyricInfos", "currentLyicText", "currentLyicIndex", "isPlaying",'playModeIndex'],

    id: <number>0,
    currentSong: {},
    // 歌曲播放时间
    currentTime: 0,
    durationTime: 0,
    // 歌词
    lyricInfos: <{ time: number; text: string }[]>[],
    // 当前歌词
    currentLyicText: '',
    currentLyicIndex: -1,

    // 进度条
    sliderValue: 0,
    // 进度条是否在改变
    isSliderChanging: false,
    // 页面
    currentPage: 0,
    contentHeight: 0,
    // 设置顶行的高度
    topLyicItem: 0,
    bottomLyicItem: 0,
    // 歌词滚动的高度
    lyricScrollTop: 0,
    // 用来点击进度条后，设置需要等待
    isWaiting: false,
    // 判断是否暂定
    isPlaying: false,
    
    // 正在播放的歌曲的数据
    playSongIndex: 0,
    playSongList: [],
    playSongPre: 0,
    // 判断是否第一次播放
    isFirstPlay: true,
    // 播放模式 0.顺序播放 1.单曲循环 2.随机播放
    playModeIndex: 0,
    show: false,
  },
  onLoad(options: any) {
    // 1.获取高度
    this.setData({
      contentHeight: app.globalData.contentHeight,
      topLyicItem: (app.globalData.contentHeight / 2) - 60,
      bottomLyicItem: (app.globalData.contentHeight / 2) - 60
    })
    // 2.获取传入的id并设置
    const id: number = options.id
    this.setData({ id })

    // 3.播放歌曲(需要判断id是否有值，如果没有传则表示回到播放页)
    if(id) playerStore.dispatch("playMusicWithSongId", id)
    
    // 获取歌曲列表
    playerStore.onStates(["playSongList","playSongIndex"], this.getPlaySongInfosHandler)
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHangler)
  },
  onUnload() {
    playerStore.offStates(['playSongList','playSongIndex'], this.getPlaySongInfosHandler)
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHangler)
  },
  // 播放歌曲的逻辑
  setupPlaySong() {
  },
  updataProgress: throttle(function(currentTime: number) {
    // @ts-ignore 
    if(this.data.isSliderChanging) return
    // 记录当前的时间
    // @ts-ignore 
    const sliderValue = (currentTime / this.data.durationTime) * 100
    // 修改进度条的进度
    // @ts-ignore 
    this.setData({
      // 秒 * 1000
      currentTime,
      sliderValue
    })
  }, 1000, {
    leading: false, trailing: false
  }),
  // 歌曲列表
  getPlaySongInfosHandler({playSongIndex , playSongList}: {
    playSongList: any,
    playSongIndex: any
  }) {
    if(playSongList) {
      this.setData({
        playSongList
      })
    }
    if(playSongIndex !== undefined) {
      this.setData({
        playSongIndex
      })
    }
  },
  // 播放歌曲
  getPlayerInfosHangler(
    {id, currentSong, currentTime, durationTime, lyricInfos, currentLyicText, currentLyicIndex, isPlaying, playModeIndex}: any
  ) {
    if( id !== undefined) {
      this.setData({ id })
    }
    if( currentSong !== undefined) {
      this.setData({ currentSong })
    }
    if( durationTime !== undefined) {
      this.setData({ durationTime })
    }
    if( currentTime !== undefined) {
      this.updataProgress(currentTime)
    }
    if( lyricInfos !== undefined) {
      this.setData({ lyricInfos })
    }
    if( currentLyicText !== undefined) {
      this.setData({ currentLyicText })
    }
    if( currentLyicIndex !== undefined) {
      this.setData({ currentLyicIndex, lyricScrollTop: currentLyicIndex * 35 })
    }
    if( isPlaying !== undefined) {
      this.setData({
        isPlaying
      })
    }
    if( playModeIndex !== undefined) {
      this.setData({
        playModeIndex
      })
    }
  },
  // 返回键
  onLeftTap() {
    wx.navigateBack()
  },
  // 监听页面切换
  onSwiperChange(event: any) {
    this.setData({
      currentPage: event.detail.current
    })
  },
  // 监听点击标题进行的页面切换
  onNavTabItemTap(event: any) {
    const index: number = event.currentTarget.dataset.index
    this.setData({
      currentPage: index
    })
  },
  // 监听滑块变化（只监听停下滑动后（点击后）的那一刻，）
  onSliderChange(event: any) {
    this.data.isWaiting = true
    setTimeout(() => {
      this.data.isWaiting = false
    }, 1000)
    // 获取滑块的值
    const value = event.detail.value
    // 计算要播放的位置的时间
    const currentTime = (value / 100) * this.data.durationTime

    // 设置播放器的时间 单位：秒，可精确到小数点后3位
    audioContext.seek(currentTime / 1000)
    // // 如果当前是停播状态，则调整后也不进行播放(无效设置),所以只能显示继续播放
    // this.setData({
    //   isPlaying: true
    // })


    // 更改显示的播放的时间
    this.setData({
      currentTime,
      sliderValue: value,
      // 停止滑动后，修改是否正在滑动的
      isSliderChanging: false
    })
  },
  // 监听在滑动滑块时的变化（滑动的每一刻都监听）,所以要节流！！！
  onSliderChanging: throttle( function(event:any) {
    // 设置变量，告诉正在滑动
    // @ts-ignore 
    this.setData({ isSliderChanging: true })
    const value = event.detail.value
    // 计算对应的时间，但是不影响播放
    // @ts-ignore 
    const currentTime = (value / 100) * this.data.durationTime
    // @ts-ignore 
    this.setData({
      currentTime
    })
  },100),
  // 监听点击暂停和播放时间
  onPlayOrPauseTap() {
    playerStore.dispatch("playMusicStatusAction")
  },
  // 监听点击上一首
  onPrevBtnTap() {
    playerStore.dispatch("playNewMusicAction",false)
  },
  // 监听点击下一首
  onNextBtnTap() {
    playerStore.dispatch("playNewMusicAction")
  },
  // 弹出当前歌曲列表
  onShowTap() {
    this.setData({ show: true });
  },
  // 关闭单曲歌曲列表
  onClose() {
    this.setData({ show: false });
  },
  // 监听播放模式的切换
  onModeBtnTap() {
    playerStore.dispatch('changePlayModeAction')
  }
  
})
