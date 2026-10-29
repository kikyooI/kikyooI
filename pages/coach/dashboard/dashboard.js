// pages/coach/dashboard/dashboard.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    stats: { totalRecords: 0 },
    today: '',
    pendingCount: 0,
    menuList: [
      { icon: '📝', name: '记录训练', url: '/pages/coach/record-edit/record-edit' },
      { icon: '📋', name: '训练记录', url: '/pages/coach/records/records' },
      { icon: '✅', name: '学员审批', url: '/pages/gym-admin/approval/approval', badge: 'pendingCount' },
      { icon: '🏷️', name: '训练类型', url: '/pages/coach/types/types' },
      { icon: '💪', name: '训练动作', url: '/pages/coach/exercises/exercises' },
      { icon: '📅', name: '训练计划', url: '/pages/coach/plans/plans' },
      { icon: '📊', name: '数据统计', url: '/pages/coach/stats/stats' },
      { icon: '👤', name: '我的资料', url: '/pages/profile/profile' }
    ]
  },

  onShow() {
    this.setData({
      name: (getApp().globalData.name || wx.getStorageSync('name') || ''),
      statusBarHeight: getApp().globalData.statusBarHeight || 20
    })
    this.loadStats()
    this.loadPending()
  },

  async loadStats() {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const stats = await api.getStats({ startDate: today, endDate: today })
      this.setData({ stats, today })
    } catch (e) {
      console.error(e)
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

  goPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  async applyGymAdmin() {
    wx.showModal({
      title: '申请成为店长',
      content: '申请后需总管理员审批，审批通过后将成为本健身房店长。是否提交申请？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.applyGymAdmin()
            wx.showModal({
              title: '申请已提交',
              content: '您的店长申请已提交，请等待总管理员审批。',
              showCancel: false
            })
          } catch (e) {
            console.error(e)
          }
        }
      }
    })
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
