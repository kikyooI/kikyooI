// pages/gym-admin/gym-info/gym-info.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    gym: null,
    name: '',
    address: '',
    phone: '',
    description: '',
    loading: false
  },

  onShow() {
    this.loadGym()
  },

  async loadGym() {
    try {
      const gyms = await api.getGyms()
      if (gyms.length > 0) {
        const gym = gyms[0]
        this.setData({
          gym,
          name: gym.name,
          address: gym.address,
          phone: gym.phone,
          description: gym.description
        })
      }
    } catch (e) {
      console.error(e)
    }
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async submit() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入健身房名称', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      await api.saveGym({
        _id: this.data.gym._id,
        name: this.data.name.trim(),
        address: this.data.address.trim(),
        phone: this.data.phone.trim(),
        description: this.data.description.trim()
      })
      wx.showToast({ title: '保存成功' })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
