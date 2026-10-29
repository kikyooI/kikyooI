// pages/record-detail/record-detail.js
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    record: null,
    loading: false,
    canEdit: false
  },

  onLoad(options) {
    if (options.id) {
      this.recordId = options.id
      this.loadDetail(options.id)
    }
  },

  onShow() {
    // 编辑返回后刷新
    if (this.recordId && this.data.record) {
      this.loadDetail(this.recordId)
    }
  },

  async loadDetail(id) {
    this.setData({ loading: true })
    try {
      const record = await api.getRecordDetail({ _id: id })
      const role = app.globalData.role
      const canEdit = ['coach', 'gym_admin', 'super_admin'].includes(role) ||
        (role === 'student' && record.studentId === app.globalData.openid)
      this.setData({ record, canEdit })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/coach/record-edit/record-edit?id=${this.recordId}` })
  },

  onDelete() {
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条训练记录吗？删除后不可恢复',
      confirmText: '删除',
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteRecord({ _id: this.recordId })
            wx.showToast({ title: '已删除' })
            setTimeout(() => wx.navigateBack(), 600)
          } catch (e) {
            console.error(e)
          }
        }
      }
    })
  }
})
