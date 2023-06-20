// components/song-item-v1/song-item-v1.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSongTap() {
      wx.navigateTo({
        url:`../../packagePlayer/pages/music-player/music-player?id=${this.data.itemData.id}`
      })
    }
  }
})
