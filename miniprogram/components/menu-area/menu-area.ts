// components/menu-area/menu-area.ts
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '默认歌单'
    },
    menuList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    screenWidth: 375
  },

  lifetimes: {
    attached() {
    // 获取屏幕尺寸
    this.setData({
      screenWidth: app.globalData.screenWidth
    })
    }
  },
  methods: {
    onMenuMoreCilck() {
      wx.navigateTo({
        url: '../../pages/detail-menu/detail-menu'
      })      
    }
  }
})
