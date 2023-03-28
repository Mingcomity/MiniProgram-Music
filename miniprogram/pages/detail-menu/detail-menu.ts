import { getSongMenuTag, getSongMenuList } from '../../services/music'
Page({
  data: {
    songMenus: []
  },
  onLoad() {
    this.fetchAllMenuList()
  },
  async fetchAllMenuList() {
    const tagRes: any = await getSongMenuTag()
    const tags = tagRes.tags

    const allPromises = []
    for (const tag of tags) {
       const promise = getSongMenuList(tag.name)
       allPromises.push(promise)
    }
    Promise.all(allPromises).then( (res: any) => {
      this.setData({
        songMenus: res
      })
    })
    
  }
})