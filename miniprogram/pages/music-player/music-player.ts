import { getSongDetail, getSongLyric } from '../../services/player'
import { throttle } from 'underscore'
import { parseLyric } from '../../utils/parse-lyric'
import playerStore from '../../store/playerStore'
import randomNum from '../../utils/randomNum'

// 创建播放器
const audioContext = wx.createInnerAudioContext()

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
    id: <number>0,
    currentSong: {},
    // 歌词
    lyricInfos: <{ time: number; text: string }[]>[],
    // 当前歌词
    currentLyicText: '',
    currentLyicIndex: -1,
    // 页面
    currentPage: 0,
    contentHeight: 0,

    // 歌曲播放时间
    currentTime: 0,
    durationTime: 0,
    // 进度条
    sliderValue: 0,
    // 进度条是否在改变
    isSliderChanging: false,
    // 用来点击进度条后，设置需要等待
    isWaiting: false,
    // 判断是否暂定
    isPlaying: true,
    // 设置顶行的高度
    topLyicItem: 0,
    bottomLyicItem: 0,
    // 歌词滚动的高度
    lyricScrollTop: 0,
    // 正在播放的歌曲的数据
    playSongIndex: 0,
    playSongList: [],
    playSongPre: 0,
    // 判断是否第一次播放
    isFirstPlay: true,
    // 播放模式 0.顺序播放 1.单曲循环 2.随机播放
    playModeIndex: 0
  },
  onLoad(options: any) {
    // 获取高度
    this.setData({
      contentHeight: app.globalData.contentHeight,
      topLyicItem: (app.globalData.contentHeight / 2) - 60,
      bottomLyicItem: (app.globalData.contentHeight / 2) - 60
    })
    // 获取传入的id并设置
    const id: number = options.id
    this.setData({ id })

    // 播放歌曲
    this.setupPlaySong()
    
    // 获取歌曲列表
    playerStore.onStates(["playSongList","playSongIndex"], this.getPlaySongInfosHandler)
  },
  onUnload() {
    playerStore.offStates(['playSongList','playSongIndex'], this.getPlaySongInfosHandler)
  },
  // 播放歌曲的逻辑
  setupPlaySong() {
    const id =this.data.id
    // 根据ID获取歌曲详情详情
    this.fetchSongDetail()
    // 根据ID获取歌词信息
    this.fetchSongLyric()
    // 播放歌曲
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // 自动播放
    audioContext.autoplay = true
    if(this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      // 监听播放的进度 __ 节流处理
      const throttleUpdataProgress = throttle(this.updataProgress, 500, {
        leading: false,
        trailing: false
      })
      audioContext.onTimeUpdate(() => {
        // 先判断是否在滑动,然后更新
        if (!this.data.isSliderChanging && !this.data.isWaiting) {
          throttleUpdataProgress()
        }
        // 匹配正确的歌词
        if (!this.data.lyricInfos.length) return
        let index = this.data.lyricInfos.length - 1
        for (let i = 0; i < this.data.lyricInfos.length; i++) {
          const info: {
            time: number
            text: string
          } = this.data.lyricInfos[i]
          if (info.time > audioContext.currentTime * 1000) {
            index = i - 1
            break
          }
        }
        if (index === this.data.currentLyicIndex) return
        this.setData({
          currentLyicText: this.data.lyricInfos[index].text ,
          currentLyicIndex: index
        })
        // 根据歌词来确定应该滚动到的位置
        const lyricScrollTop = index * 35 
        this.setData({
          lyricScrollTop
        })
      }),
      //  用来解决进度条变化导致的监听失败
      audioContext.onWaiting(() => {
        audioContext.pause()
      })
      audioContext.onCanplay(() => {
        audioContext.play()
      })
      // 监听播放结束后，自动播放下一首
      audioContext.onEnded(()=>{
        switch (this.data.playModeIndex) {
          case 0:
            this.songCut(this.data.playSongIndex+1)
            break;
          case 1:
            this.songCut(this.data.playSongIndex)
            break;
          case 2:
            const newIndex = randomNum(0,this.data.playSongList.length)
            let index = newIndex === this.data.playSongIndex ?  randomNum(0,this.data.playSongList.length) : newIndex
            this.songCut(index)
            break;
          default:
            break;
        }
      })
      }
  },
  updataProgress() {
    // 记录当前的时间
    const sliderValue = (this.data.currentTime / this.data.durationTime) * 100
    // 修改进度条的进度
    this.setData({
      // 秒 * 1000
      currentTime: audioContext.currentTime * 1000,
      sliderValue
    })
  },
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
    if (!audioContext.paused) {
      // 暂停
      audioContext.pause()
      this.setData({
        isPlaying: false
      })
    } else {
      // 播放
      audioContext.play()
      this.setData({
        isPlaying: true
      })
    }
  },
  // 监听点击上一首
  onPrevBtnTap() {
    switch (this.data.playModeIndex) {
      case 0:
        this.songCut(this.data.playSongIndex-1)
        break;
      case 1:
        this.songCut(this.data.playSongIndex-1)
        break;
      case 2:
        this.songCut(this.data.playSongPre)
        break;
      default:
        break;
    }
  },
  // 监听点击下一首
  onNextBtnTap() {
    switch (this.data.playModeIndex) {
      case 0:
        this.songCut(this.data.playSongIndex+1)
        break;
      case 1:
        this.songCut(this.data.playSongIndex+1)
        break;
      case 2:
        const newIndex = randomNum(0,this.data.playSongList.length)
        let index = newIndex === this.data.playSongIndex ?  randomNum(0,this.data.playSongList.length) : newIndex
        this.songCut(index)
        break;
      default:
        break;
    }
  },
  // 监听播放模式的切换
  onModeBtnTap() {
    let index = this.data.playModeIndex;
    index = index === 2 ? 0 : index + 1 
    this.setData({
      playModeIndex: index
    })
  },
  async fetchSongDetail() {
    const res: any = await getSongDetail(this.data.id)
    this.setData({
      currentSong: res.songs[0],
      // 毫秒
      durationTime: res.songs[0].dt
    })
  },
  async fetchSongLyric() {
    const res: any = await getSongLyric(this.data.id)
    const lrcString = res.lrc.lyric
    const lyricInfos = parseLyric(lrcString)
    this.setData({
      lyricInfos
    })
  },
  // 抽离函数：传入最新index，进行处理
  songCut(index: number) {
    // 记录切换前上一首歌
    if(index !== this.data.playSongIndex) {
      this.data.playSongPre = this.data.playSongIndex
      const length = this.data.playSongList.length
      // 先判断播放模式
      if(this.data.playModeIndex === 0 || this.data.playModeIndex === 1) {
        if(index === length) {
          index = 0
        } else if( index === -1 ) {
          index = length-1
        }
      }
      const newSong:any = this.data.playSongList[index]
      // 修改仓库里的当前播放歌曲
      playerStore.setState("playSongIndex", index)
      this.setData({
        id: newSong.id
      })    
      // 将之前的歌曲进行初始化
      this.setData({currentSong: {}, currentTime: 0,durationTime: 0, sliderValue: 0})
      // 播放新的歌曲
      this.setupPlaySong()
  } else {
    // 重播逻辑
    audioContext.stop()
    audioContext.play()
  }
  }
})
