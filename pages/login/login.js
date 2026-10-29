// pages/login/login.js
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    loading: false
  },

  onLoad() {
    this.checkLogin()
  },

  async checkLogin() {
    try {
      await app.checkLogin()
      app.goHome()
    } catch (e) {
      // 未登录，显示登录按钮
    }
  },

  async onLogin() {
    this.setData({ loading: true })
    try {
      const res = await api.login()
      if (res.isNew) {
        // 新用户，去选择角色
        wx.navigateTo({ url: '/pages/select-role/select-role' })
      } else {
        // 老用户，保存信息并跳转
        app.setLogin(res)
        app.goHome()
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
