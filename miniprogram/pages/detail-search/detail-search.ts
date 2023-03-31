import {getSearchHot,  getSearchSuggest,  getSearchResult} from '../../services/search'
import playerStore from '../../store/playerStore'
import debounce from '../../utils/debounce'
import stringToNodes from '../../utils/string2nodes'

const debounceGetSearchSuggest = debounce(getSearchSuggest, 100)

Page({

  data: {
    // 输入框数据
    searchValue:'',
    // 推荐搜索数据
    hotKeywords:'',
    suggestSongs: [],
    suggestSongsNodes: <any>[],
    resultSongs: [],
  },
  onLoad() {
    this.getPageData()
  },
  handleSearchChange(event: any) {
    const searchValue: any = event.detail
    this.setData({ searchValue })
    if (!searchValue.length) {
      this.setData({ suggestSongs: [], resultSongs: [] })
      debounceGetSearchSuggest.cancel()
      return
    }
    // 根据输入值进行搜索
    debounceGetSearchSuggest(searchValue).then((res: any) => {

      // 1.获取建议的关键字歌曲
      const suggestSongs = res.result.allMatch
      this.setData({ suggestSongs })
      if (!suggestSongs) return

      // 2.转成nodes节点
      const suggestKeywords = suggestSongs.map((item: any) => item.keyword)
      const suggestSongsNodes = []
      for (const keyword of suggestKeywords) {
        const nodes = stringToNodes(keyword, searchValue)
        suggestSongsNodes.push(nodes)
      }
      this.setData({ suggestSongsNodes })
    })
  },
  onSongItemTap(event: any) {
    playerStore.setState("playSongList", this.data.resultSongs)
    playerStore.setState("playSongIndex",event.currentTarget.dataset.index)
  },
  // 网络请求
  getPageData: function() {
    getSearchHot().then((res: any) => {
      this.setData({ hotKeywords: res.result.hots })
    })
  },
  handleSearchAction: function() {
    const searchValue = this.data.searchValue
    getSearchResult(searchValue).then((res: any) => {
      this.setData({ resultSongs: res.result.songs })
    })
  },
  handleKeywordItemClick: function(event: any) {
    // 1.获取点击的关键字
    const keyword = event.currentTarget.dataset.keyword

    // 2.将关键设置到searchValue中
    this.setData({ searchValue: keyword })

    // 3.发送网络请求
    this.handleSearchAction()
  }
})