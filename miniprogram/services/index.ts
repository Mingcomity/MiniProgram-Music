
// 封装成类
class hyRequest {
  readonly baseURL: string
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  // 请求方法
  request(options: WechatMiniprogram.RequestOption) {
    const { url } = options
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: this.baseURL + url,
        success: (res) => {
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
  // get请求
  get(options:  WechatMiniprogram.RequestOption) {
    return this.request({...options, method: "GET"})
  }
  // post请求
  post(options:  WechatMiniprogram.RequestOption) {
    return this.request({...options, method: "POST"})
  }
}
export const HYRequest = new hyRequest('http://codercba.com:9002')