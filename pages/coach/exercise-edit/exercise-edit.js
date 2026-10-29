// pages/coach/exercise-edit/exercise-edit.js
const api = require('../../../utils/api.js')

Page({
  data: {
    _id: '',
    typeId: '',
    name: '',
    description: '',
    types: [],
    typeIndex: 0,
    loading: false
  },

  onLoad(options) {
    this.setData({ typeId: options.typeId || '' })
    if (options.id) {
      this.setData({ _id: options.id })
      wx.setNavigationBarTitle({ title: '编辑动作' })
      this.loadDetail(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增动作' })
    }
    this.loadTypes()
  },

  async loadTypes() {
    try {
      const types = await api.getTypes()
      this.setData({ types })
      if (this.data.typeId) {
        const idx = types.findIndex(t => t._id === this.data.typeId)
        if (idx >= 0) this.setData({ typeIndex: idx })
      }
    } catch (e) {
      console.error(e)
    }
  },

  async loadDetail(id) {
    try {
      const exercises = await api.getExercises({})
      const ex = exercises.find(e => e._id === id)
      if (ex) {
        this.setData({ name: ex.name, description: ex.description || '', typeId: ex.typeId })
      }
    } catch (e) {
      console.error(e)
    }
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  onTypeChange(e) {
    const idx = Number(e.detail.value)
    this.setData({ typeIndex: idx, typeId: this.data.types[idx]._id })
  },

  async submit() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入动作名称', icon: 'none' })
      return
    }
    if (!this.data.typeId) {
      wx.showToast({ title: '请选择训练类型', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      await api.saveExercise({
        _id: this.data._id || undefined,
        name: this.data.name.trim(),
        typeId: this.data.typeId,
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
