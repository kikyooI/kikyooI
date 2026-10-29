// pages/coach/type-edit/type-edit.js
const api = require('../../../utils/api.js')

Page({
  data: {
    _id: '',
    name: '',
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ _id: options.id })
      wx.setNavigationBarTitle({ title: '编辑类型' })
      this.loadDetail(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增类型' })
    }
  },

  async loadDetail(id) {
    try {
      const types = await api.getTypes()
      const t = types.find(t => t._id === id)
      if (t) this.setData({ name: t.name })
    } catch (e) {
      console.error(e)
    }
  },

  onInput(e) {
    this.setData({ name: e.detail.value })
  },

  async submit() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      await api.saveType({ _id: this.data._id || undefined, name: this.data.name.trim() })
      wx.showToast({ title: '保存成功' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
