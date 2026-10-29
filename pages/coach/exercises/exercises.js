// pages/coach/exercises/exercises.js
const api = require('../../../utils/api.js')

Page({
  data: {
    typeId: '',
    typeName: '',
    types: [],
    typeIndex: 0,
    exercises: [],
    loading: false
  },

  onLoad(options) {
    if (options.typeId) {
      this.setData({ typeId: options.typeId })
    }
  },

  onShow() {
    this.loadTypes()
  },

  async loadTypes() {
    try {
      const types = await api.getTypes()
      let typeIndex = 0
      if (this.data.typeId) {
        const idx = types.findIndex(t => t._id === this.data.typeId)
        if (idx >= 0) typeIndex = idx
      }
      // 首次进入未指定类型时，默认选中第一个类型，避免"显示该类型但列出全部动作"
      const typeId = types[typeIndex] ? types[typeIndex]._id : ''
      this.setData({ types, typeIndex, typeId }, () => {
        this.loadExercises()
      })
    } catch (e) {
      console.error(e)
      this.loadExercises()
    }
  },

  onTypeChange(e) {
    const index = Number(e.detail.value)
    const typeId = this.data.types[index] ? this.data.types[index]._id : ''
    this.setData({ typeIndex: index, typeId })
    this.loadExercises()
  },

  async loadExercises() {
    this.setData({ loading: true })
    try {
      const params = {}
      if (this.data.typeId) params.typeId = this.data.typeId
      const exercises = await api.getExercises(params)
      this.setData({ exercises })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onAdd() {
    wx.navigateTo({ url: `/pages/coach/exercise-edit/exercise-edit?typeId=${this.data.typeId}` })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/coach/exercise-edit/exercise-edit?id=${id}&typeId=${this.data.typeId}` })
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定删除该动作吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteExercise({ _id: id })
            wx.showToast({ title: '已删除' })
            this.loadExercises()
          } catch (err) {
            console.error(err)
          }
        }
      }
    })
  }
})
