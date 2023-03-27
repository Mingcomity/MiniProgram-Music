Component({
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onVideoItemTap() {
      wx.navigateTo({
        url: `../detail-video/detail-video?id=${this.data.itemData.id}`
      })
    }
  }
})