// pages/coach/types/types.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    types: [],
    loading: false
  },

  onShow() {
    this.loadTypes()
  },

  async loadTypes() {
    this.setData({ loading: true })
    try {
      const types = await api.getTypes()
      this.setData({ types })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/coach/type-edit/type-edit' })
  },

  async onSeed() {
    wx.showModal({
      title: '导入初始数据',
      content: '将导入5个训练类型（胸部、背部、肩部、腿部、功能性）及对应训练动作。确定导入吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.seedData()
            wx.showToast({ title: result.message || '导入成功', icon: 'none' })
            this.loadTypes()
          } catch (err) {
            console.error(err)
          }
        }
      }
    })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/coach/type-edit/type-edit?id=${id}` })
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定删除该训练类型吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteType({ _id: id })
            wx.showToast({ title: '已删除' })
            this.loadTypes()
          } catch (err) {
            console.error(err)
          }
        }
      }
    })
  },

  goExercises(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/coach/exercises/exercises?typeId=${id}` })
  }
})
