// pages/gym-admin/dashboard/dashboard.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    pendingCount: 0,
    isSuperAdmin: false,
    menuList: [
      { icon: '✅', name: '审批中心', url: '/pages/gym-admin/approval/approval' },
      { icon: '👥', name: '用户管理', url: '/pages/gym-admin/users/users' },
      { icon: '🏢', name: '健身房信息', url: '/pages/gym-admin/gym-info/gym-info' },
      { icon: '🏷️', name: '训练类型', url: '/pages/coach/types/types' },
      { icon: '💪', name: '训练动作', url: '/pages/coach/exercises/exercises' },
      { icon: '📝', name: '训练计划', url: '/pages/coach/plans/plans' },
      { icon: '✏️', name: '记录训练', url: '/pages/coach/record-edit/record-edit' },
      { icon: '📋', name: '训练记录', url: '/pages/coach/records/records' },
      { icon: '📊', name: '数据统计', url: '/pages/coach/stats/stats' },
      { icon: '👤', name: '我的资料', url: '/pages/profile/profile' }
    ]
  },

  onShow() {
    this.setData({
      isSuperAdmin: app.globalData.role === 'super_admin' && !!wx.getStorageSync('currentGymId')
    })
    this.loadPending()
  },

  exitGym() {
    wx.removeStorageSync('currentGymId')
    wx.reLaunch({ url: '/pages/super-admin/gyms/gyms' })
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
