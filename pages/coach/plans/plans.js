// pages/coach/plans/plans.js
const api = require('../../../utils/api.js')

Page({
  data: {
    plans: [],
    studentId: '',
    loading: false
  },

  onLoad(options) {
    // 从学员列表跳转过来时，只看该学员的计划
    if (options.studentId) {
      this.setData({ studentId: options.studentId })
      if (options.studentName) {
        wx.setNavigationBarTitle({ title: decodeURIComponent(options.studentName) + '的训练计划' })
      }
    }
  },

  onShow() {
    this.loadPlans()
  },

  async loadPlans() {
    this.setData({ loading: true })
    try {
      const params = {}
      if (this.data.studentId) params.studentId = this.data.studentId
      const plans = await api.getPlans(params)
      this.setData({ plans })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/coach/plan-edit/plan-edit' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/coach/plan-edit/plan-edit?id=${id}` })
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定删除该训练计划吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deletePlan({ _id: id })
            wx.showToast({ title: '已删除' })
            this.loadPlans()
          } catch (err) {
            console.error(err)
          }
        }
      }
    })
  }
})
