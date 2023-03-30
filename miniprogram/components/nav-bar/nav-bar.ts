// components/nav-bar/nav-bar.ts
const app = getApp()
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '标题'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusHeight: 20,
    navHeight: 44
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInLeftClick() {
      this.triggerEvent('leftClick')
    }
  },
  lifetimes: {
    attached() {
      // 获取设备信息
    this.setData({
      statusHeight: app.globalData.statusHeight,
      navHeight: app.globalData.navHeight
    })
    }
  }
})
