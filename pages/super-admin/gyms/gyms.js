// pages/super-admin/gyms/gyms.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    gyms: [],
    pendingCount: 0,
    loading: false
  },

  onShow() {
    const app = getApp()
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    this.loadGyms()
    this.loadPending()
  },

  async loadGyms() {
    this.setData({ loading: true })
    try {
      const gyms = await api.getGyms()
      this.setData({ gyms })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadPending() {
    try {
      const users = await api.getPendingUsers()
      this.setData({ pendingCount: users.length })
    } catch (e) {
      console.error(e)
    }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/super-admin/gym-edit/gym-edit' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/super-admin/gym-edit/gym-edit?id=${id}` })
  },

  goAdmins(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/super-admin/gym-admins/gym-admins?gymId=${id}` })
  },

  enterGym(e) {
    const id = e.currentTarget.dataset.id
    // 超管进入健身房管理模式，临时设置 gymId
    wx.setStorageSync('currentGymId', id)
    wx.reLaunch({ url: '/pages/gym-admin/dashboard/dashboard' })
  },

  goApproval() {
    wx.navigateTo({ url: '/pages/gym-admin/approval/approval' })
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) app.logout()
      }
    })
  }
})
