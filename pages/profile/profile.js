// pages/profile/profile.js
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    name: '',
    phone: '',
    roleName: '',
    gymName: '',
    loading: false
  },

  onLoad() {
    const roleMap = { super_admin: '总管理员', gym_admin: '店长', coach: '教练', student: '学员' }
    this.setData({
      name: app.globalData.name || '',
      roleName: roleMap[app.globalData.role] || ''
    })
    this.loadDetail()
  },

  async loadDetail() {
    try {
      const users = await api.getUsers()
      const me = users.find(u => u.openid === app.globalData.openid)
      if (me) {
        this.setData({ name: me.name, phone: me.phone || '' })
      }
    } catch (e) {
      console.error(e)
    }
    try {
      const gyms = await api.getGyms()
      const gym = gyms.find(g => g._id === app.globalData.gymId)
      this.setData({
        gymName: gym
          ? gym.name
          : (app.globalData.gymId ? '未匹配到健身房（数据异常）' : '未绑定健身房')
      })
    } catch (e) {
      console.error(e)
    }
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async submit() {
    const { name, phone } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      await api.updateUser({ action: 'updateSelf', name: name.trim(), phone: phone.trim() })
      app.globalData.name = name.trim()
      wx.setStorageSync('name', name.trim())
      wx.showToast({ title: '已保存' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
