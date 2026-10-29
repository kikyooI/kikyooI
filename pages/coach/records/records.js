// pages/coach/records/records.js
const api = require('../../../utils/api.js')

Page({
  data: {
    records: [],
    students: [],
    studentIndex: 0,
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad(options) {
    // 从学员列表跳转过来时，预设学员筛选
    this.presetStudentId = options.studentId || ''
    if (options.studentName) {
      wx.setNavigationBarTitle({ title: decodeURIComponent(options.studentName) + '的训练记录' })
    }
    this.loadStudents()
  },

  onShow() {
    if (this.data.students.length > 0) this.loadRecords()
  },

  async loadStudents() {
    try {
      const students = await api.getStudents()
      const list = [{ openid: '', name: '全部学员' }, ...students]
      let studentIndex = 0
      if (this.presetStudentId) {
        const idx = list.findIndex(s => s.openid === this.presetStudentId)
        if (idx > 0) studentIndex = idx
        this.presetStudentId = ''
      }
      this.setData({ students: list, studentIndex }, () => this.loadRecords())
    } catch (e) {
      console.error(e)
    }
  },

  async loadRecords(reset = true) {
    if (reset) this.setData({ page: 1, records: [], hasMore: true })
    this.setData({ loading: true })
    try {
      const student = this.data.students[this.data.studentIndex]
      const params = { page: this.data.page, pageSize: this.data.pageSize }
      if (student && student.openid) params.studentId = student.openid
      const list = await api.getRecords(params)
      this.setData({
        records: reset ? list : [...this.data.records, ...list],
        hasMore: list.length >= this.data.pageSize
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadRecords(false)
  },

  onStudentChange(e) {
    this.setData({ studentIndex: Number(e.detail.value) })
    this.loadRecords()
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/coach/record-edit/record-edit' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/record-detail/record-detail?id=${id}` })
  }
})
