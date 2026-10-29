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
    hasMore: true,
    stats: { count: 0, actions: 0, types: 0 }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.setData({
      name: app.globalData.name || '',
      statusBarHeight: app.globalData.statusBarHeight || 20
    })
    this.loadRecords()
  },

  async loadRecords(reset = true) {
    if (reset) this.setData({ page: 1, records: [], hasMore: true })
    this.setData({ loading: true })
    try {
      const list = await api.getRecords({ page: this.data.page, pageSize: this.data.pageSize })
      const records = reset ? list : [...this.data.records, ...list]
      this.setData({
        records,
        hasMore: list.length >= this.data.pageSize,
        stats: this.buildStats(records)
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

  // 顶部概览统计（基于已加载的记录）
  buildStats(records) {
    let actions = 0
    const types = new Set()
    records.forEach(r => {
      actions += (r.items || []).length
      if (r.typeName) types.add(r.typeName)
    })
    return { count: records.length, actions, types: types.size }
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
