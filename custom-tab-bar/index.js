Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/student/records/records', icon: '📋', text: '训练记录' },
      { pagePath: '/pages/student/plans/plans', icon: '📅', text: '训练计划' },
      { pagePath: '/pages/student/stats/stats', icon: '📊', text: '数据统计' }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      if (index === this.data.selected) return
      wx.switchTab({ url: path })
    }
  }
})
