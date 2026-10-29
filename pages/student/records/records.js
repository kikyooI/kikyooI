// pages/student/records/records.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    records: [],
    name: '',
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.setData({ name: app.globalData.name || '' })
    this.loadRecords()
  },

  async loadRecords(reset = true) {
    if (reset) this.setData({ page: 1, records: [], hasMore: true })
    this.setData({ loading: true })
    try {
      const list = await api.getRecords({ page: this.data.page, pageSize: this.data.pageSize })
      this.setData({
        records: reset ? list : [...this.data.records, ...list],
        hasMore: list.length >= this.data.pageSize
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadRecords(false)
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/coach/record-edit/record-edit' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/record-detail/record-detail?id=${id}` })
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
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
