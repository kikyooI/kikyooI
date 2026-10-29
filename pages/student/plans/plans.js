// pages/student/plans/plans.js
const api = require('../../../utils/api.js')

const app = getApp()

Page({
  data: {
    plans: [],
    loading: false,
    openid: ''
  },

  onLoad() {
    this.setData({ openid: app.globalData.openid })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadPlans()
  },

  async loadPlans() {
    this.setData({ loading: true })
    try {
      const plans = await api.getPlans()
      this.setData({ plans })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/student/plan-edit/plan-edit' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/student/plan-edit/plan-edit?id=${id}` })
  }
})
