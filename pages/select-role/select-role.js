// pages/select-role/select-role.js
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    role: 'student',
    gyms: [],
    gymIndex: 0,
    name: '',
    phone: '',
    loading: false
  },

  onLoad(options) {
    // 被驳回/禁用后重新申请：回填已有资料
    this.isReapply = !!options.reapply
    if (this.isReapply && app.globalData.name) {
      this.setData({
        name: app.globalData.name,
        role: app.globalData.role === 'coach' ? 'coach' : 'student'
      })
    }
    this.loadGyms()
  },

  async loadGyms() {
    try {
      const gyms = await api.getGyms()
      let gymIndex = 0
      if (this.isReapply && app.globalData.gymId) {
        const idx = gyms.findIndex(g => g._id === app.globalData.gymId)
        if (idx >= 0) gymIndex = idx
      }
      this.setData({ gyms, gymIndex })
    } catch (e) {
      console.error(e)
    }
  },

  selectRole(e) {
    this.setData({ role: e.currentTarget.dataset.role })
  },

  onGymChange(e) {
    this.setData({ gymIndex: Number(e.detail.value) })
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async submit() {
    const { role, gyms, gymIndex, name, phone } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (gyms.length === 0) {
      wx.showToast({ title: '暂无可用健身房', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    try {
      const res = await api.bindGym({
        role,
        gymId: gyms[gymIndex]._id,
        name: name.trim(),
        phone: phone.trim()
      })
      app.setLogin(res)
      wx.showModal({
        title: '提交成功',
        content: '您的申请已提交，请等待健身房管理员审批。',
        showCancel: false,
        success: () => {
          app.goHome()
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
