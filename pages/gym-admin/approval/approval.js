// pages/gym-admin/approval/approval.js
const api = require('../../../utils/api.js')

Page({
  data: {
    users: [],
    loading: false
  },

  onShow() {
    this.loadUsers()
  },

  async loadUsers() {
    this.setData({ loading: true })
    try {
      const users = await api.getPendingUsers()
      this.setData({ users })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  async approve(e) {
    const userId = e.currentTarget.dataset.id
    try {
      await api.approveUser({ userId, action: 'approve' })
      wx.showToast({ title: '已通过' })
      this.loadUsers()
    } catch (err) {
      console.error(err)
    }
  },

  async reject(e) {
    const userId = e.currentTarget.dataset.id
    try {
      await api.approveUser({ userId, action: 'reject' })
      wx.showToast({ title: '已驳回' })
      this.loadUsers()
    } catch (err) {
      console.error(err)
    }
  }
})
