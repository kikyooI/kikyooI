// pages/gym-admin/users/users.js
const api = require('../../../utils/api.js')

Page({
  data: {
    users: [],
    filterRole: '',
    loading: false,
    isSuperAdmin: false
  },

  onShow() {
    this.setData({ isSuperAdmin: getApp().globalData.role === 'super_admin' })
    this.loadUsers()
  },

  async loadUsers() {
    this.setData({ loading: true })
    try {
      const params = {}
      if (this.data.filterRole) params.role = this.data.filterRole
      const users = await api.getUsers(params)
      this.setData({ users })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onFilter(e) {
    this.setData({ filterRole: e.currentTarget.dataset.role }, () => {
      this.loadUsers()
    })
  },

  goEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/gym-admin/user-edit/user-edit?id=${id}` })
  },

  goRecords(e) {
    const { openid, name } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/coach/records/records?studentId=${openid}&studentName=${encodeURIComponent(name)}` })
  },

  goPlans(e) {
    const { openid, name } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/coach/plans/plans?studentId=${openid}&studentName=${encodeURIComponent(name)}` })
  },

  async setAdmin(e) {
    const userId = e.currentTarget.dataset.id
    wx.showModal({
      title: '设为管理员',
      content: '确定将该教练设为健身房管理员吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.updateUser({ userId, action: 'setAdmin' })
            wx.showToast({ title: '已设为管理员' })
            this.loadUsers()
          } catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  async removeAdmin(e) {
    const userId = e.currentTarget.dataset.id
    wx.showModal({
      title: '移除管理员',
      content: '确定移除该管理员权限吗？移除后将恢复为教练身份。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.updateUser({ userId, action: 'removeAdmin' })
            wx.showToast({ title: '已移除管理员权限' })
            this.loadUsers()
          } catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  async deleteUser(e) {
    const userId = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除用户',
      content: '确定删除该用户吗？删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.updateUser({ userId, action: 'deleteUser' })
            wx.showToast({ title: '已删除' })
            this.loadUsers()
          } catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  async enableUser(e) {
    const userId = e.currentTarget.dataset.id
    try {
      await api.updateUser({ userId, action: 'enableUser' })
      wx.showToast({ title: '已启用' })
      this.loadUsers()
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  }
})
