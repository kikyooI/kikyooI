// pages/super-admin/gym-edit/gym-edit.js
const api = require('../../../utils/api.js')

Page({
  data: {
    _id: '',
    name: '',
    address: '',
    phone: '',
    description: '',
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ _id: options.id })
      this.loadDetail(options.id)
    }
  },

  async loadDetail(id) {
    try {
      const gyms = await api.getGyms()
      const gym = gyms.find(g => g._id === id)
      if (gym) {
        this.setData({
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
        _id: this.data._id || undefined,
        name: this.data.name.trim(),
        address: this.data.address.trim(),
        phone: this.data.phone.trim(),
        description: this.data.description.trim()
      })
      wx.showToast({ title: '保存成功' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
