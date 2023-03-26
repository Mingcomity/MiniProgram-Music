Page({
  data: {
    id: 0
  },
  onLoad(options:any) {
    const id = options.id
    this.setData({
      id
    })
  }
})