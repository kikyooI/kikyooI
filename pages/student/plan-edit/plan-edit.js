// pages/student/plan-edit/plan-edit.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    _id: '',
    name: '',
    planDate: '',
    types: [],
    typeIndex: 0,
    typeId: '',
    exercises: [],
    items: [],
    loading: false
  },

  onLoad(options) {
    const today = new Date().toISOString().slice(0, 10)
    this.setData({ planDate: today })
    if (options.id) {
      this.setData({ _id: options.id })
      this.loadDetail(options.id)
    }
    this.loadTypes()
  },

  async loadTypes() {
    try {
      const types = await api.getTypes()
      this.setData({ types })
      if (types.length > 0) {
        this.setData({ typeId: types[0]._id })
        this.loadExercises()
      }
    } catch (e) {
      console.error(e)
    }
  },

  async loadExercises() {
    try {
      const exercises = await api.getExercises({ typeId: this.data.typeId })
      this.setData({ exercises })
    } catch (e) {
      console.error(e)
    }
  },

  async loadDetail(id) {
    try {
      const plans = await api.getPlans()
      const plan = plans.find(p => p._id === id)
      if (plan) {
        this.setData({
          name: plan.name,
          typeId: plan.typeId,
          planDate: plan.planDate || this.data.planDate,
          items: plan.items || []
        })
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
    const type = this.data.types[idx]
    this.setData({ typeIndex: idx, typeId: type._id })
    this.loadExercises()
  },

  onDateChange(e) {
    this.setData({ planDate: e.detail.value })
  },

  onExercisePick(e) {
    const ex = this.data.exercises[Number(e.detail.value)]
    if (!ex) return
    const newItems = [...this.data.items, {
      _id: Date.now() + '_' + Math.random(),
      exerciseId: ex._id,
      name: ex.name,
      sets: 3,
      targetReps: 12
    }]
    this.setData({ items: newItems })
  },

  onNoExercise() {
    wx.showToast({ title: '该类型下暂无动作，请先到动作库添加', icon: 'none' })
  },

  onRemoveExercise(e) {
    const idx = e.currentTarget.dataset.idx
    const items = this.data.items.filter((_, i) => i !== idx)
    this.setData({ items })
  },

  onItemInput(e) {
    const { idx, field } = e.currentTarget.dataset
    const items = this.data.items
    items[idx][field] = Number(e.detail.value) || 0
    this.setData({ items: [...items] })
  },

  async submit() {
    const { name, items } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入计划名称', icon: 'none' })
      return
    }
    if (items.length === 0) {
      wx.showToast({ title: '请添加训练动作', icon: 'none' })
      return
    }

    const submitItems = items.map(it => ({
      exerciseId: it.exerciseId,
      name: it.name,
      sets: it.sets,
      targetReps: it.targetReps
    }))

    this.setData({ loading: true })
    try {
      await api.savePlan({
        _id: this.data._id || undefined,
        name: name.trim(),
        typeId: this.data.typeId,
        items: submitItems,
        assignedTo: app.globalData.openid,
        assignedToName: app.globalData.name,
        planDate: this.data.planDate
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
