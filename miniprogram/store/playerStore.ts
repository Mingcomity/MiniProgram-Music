// @ts-ignore 
import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric} from '../services/player'
import { parseLyric } from '../utils/parse-lyric'
import randomNum from '../utils/randomNum'

// 创建播放器
export const audioContext = wx.createInnerAudioContext()


const playerStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0,
    playSongPreIndex: 0,

    // 歌曲信息
    id: <number>0,
    currentSong: {},
    // 歌曲播放时间
    currentTime: 0,
    durationTime: 0,

    // 歌词信息
    lyricInfos: <{ time: number; text: string }[]>[],
    // 当前歌词
    currentLyicText: '',
    currentLyicIndex: -1,
    // 判断是否第一次播放
    isFirstPlay: true,
    // 是否正在播放
    isPlaying: false,
    // 播放模式 0.顺序播放 1.单曲循环 2.随机播放
    playModeIndex: 0,
  },
  actions: {
    // 播放一首歌需要的逻辑
    playMusicWithSongId(ctx: any,id: number) {
      // 0.清空原有数据
      ctx.currentSong = {}
      ctx.durationTime = 0
      ctx.currentTime = 0
      ctx.currentLyicIndex = 0
      ctx.currentLyicText = ''
      ctx.lyricInfos = []
      // 1.储存传入的歌曲id
      ctx.id = id
      ctx.isPlaying = true
      // 2.根据ID获取歌曲详情详情
      getSongDetail(ctx.id).then((res:any) => {
        ctx.currentSong = res.songs[0],
        // 毫秒
        ctx.durationTime = res.songs[0].dt
      })
      // 3.根据ID获取歌词信息
      getSongLyric(ctx.id).then((res: any) => {
        const lrcString = res.lrc.lyric
        const lyricInfos = parseLyric(lrcString)
        ctx.lyricInfos = lyricInfos
      })

      // 4.停止上一首歌曲
      audioContext.stop()
      // 5.设置播放歌曲
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 6.同时判断是否为第一次播放歌曲，避免添加多次监听
      if(ctx.isFirstPlay) {
        // 6.1.设置不是第一次播放歌曲
        ctx.isFirstPlay = false
        
        // 6.2.监听歌曲在播放的过程
        audioContext.onTimeUpdate(() => {
          // 6.2.1记录当前正在播放时间
          ctx.currentTime = audioContext.currentTime * 1000
          // 6.2.2根据当前播放时间，匹配正确的歌词
          if (!ctx.lyricInfos.length) return
          let index = ctx.lyricInfos.length - 1
          for (let i = 0; i < ctx.lyricInfos.length; i++) {
            const info: {
              time: number
              text: string
            } = ctx.lyricInfos[i]
            if (info.time > audioContext.currentTime * 1000) {
              index = i - 1
              break
            }
          }
          if (index === ctx.currentLyicIndex || index === -1) return
          const currentLyicText = ctx.lyricInfos[index].text
          ctx.currentLyicText = currentLyicText
          ctx.currentLyicIndex = index
        }),
        // 6.3用来解决进度条变化导致的监听失败
        audioContext.onWaiting(() => {
          audioContext.pause()
        })
        audioContext.onCanplay(() => {
          audioContext.play()
        })
        // 6.4监听播放结束后，自动播放下一首
        audioContext.onEnded(()=>{
          // 6.4.1 如果是单曲循环，则不需要切换歌曲
          if(audioContext.loop) return
          // @ts-ignore 
          this.dispatch("playNewMusicAction")
        })
        }
    },
    // 修改播放状态
    playMusicStatusAction(ctx: any) {
      if (!audioContext.paused) {
        // 暂停
        audioContext.pause()
          ctx.isPlaying= false
      } else {
        // 播放
        audioContext.play()
          ctx.isPlaying= true
      }
    },
    // 改变模式
    changePlayModeAction(ctx: any) {
      let index = ctx.playModeIndex;
      index = index === 2 ? 0 : index + 1 
      ctx.playModeIndex = index
      // 设置是否是单曲循环
      if (index === 1) {
        audioContext.loop = true
      } else {
        audioContext.loop = false
      }
    },
    // 切换下一首
    playNewMusicAction(ctx: any, isNext: boolean = true ) {
      const length = ctx.playSongList.length
      let index = ctx.playSongIndex 
      switch (ctx.playModeIndex) {
        // 顺序播放
        case 0:
          if(isNext) {
            index++
            if(index >= length) index = 0
          } else {
            index--
            if(index < 0) index = length-1
          }
          break;
        // 单曲循环 
        case 1:
          if(isNext) {
            index++
            if(index >= length) index = 0
          } else {
            // 给到原先播放的歌曲
            index = ctx.playSongPreIndex
          }
           break;
        // 随机播放  
        case 2:
          if(isNext) {
            const newIndex = randomNum(0,length-1)
          index = newIndex === index.playSongIndex ?  randomNum(0,length-1) : newIndex
          } else {
            // 给到原先播放的歌曲
            index = ctx.playSongPreIndex
          }
           break;
        default:
          break;
      }
      
      // 获取需要播放的歌曲的id
      const newSong :any = ctx.playSongList[index]
      
      // 播放新的歌曲
      // @ts-ignore 
      this.dispatch("playMusicWithSongId", newSong.id)

      // 记录上一次播放的歌曲
      ctx.playSongPreIndex = ctx.playSongIndex

      // 设置当前新播放的歌曲
      ctx.playSongIndex = index
    }
  }
})

export default playerStore
