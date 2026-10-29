// pages/student/stats/stats.js
const api = require('../../../utils/api.js')

Page({
  data: {
    stats: null,
    loading: false,
    exerciseTrend: []
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.loadStats()
  },

  async loadStats() {
    this.setData({ loading: true })
    try {
      const stats = await api.getStats()
      const trends = Object.values(stats.exerciseTrend || {})
      this.setData({ stats, exerciseTrend: trends.slice(0, 5) })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
