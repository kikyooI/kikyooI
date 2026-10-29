// pages/coach/stats/stats.js
const api = require('../../../utils/api.js')

Page({
  data: {
    stats: null,
    students: [],
    studentIndex: 0,
    loading: false,
    selectedExercise: '',
    exerciseTrend: []
  },

  onLoad() {
    this.loadStudents()
  },

  onShow() {
    this.loadStats()
  },

  async loadStudents() {
    try {
      const students = await api.getStudents()
      this.setData({ students: [{ openid: '', name: '全部学员' }, ...students] })
    } catch (e) {
      console.error(e)
    }
  },

  async loadStats() {
    this.setData({ loading: true })
    try {
      const student = this.data.students[this.data.studentIndex]
      const params = {}
      if (student && student.openid) params.studentId = student.openid
      const stats = await api.getStats(params)
      // 找出重量趋势最大的几个动作
      const trends = Object.values(stats.exerciseTrend || {})
      this.setData({ stats, exerciseTrend: trends.slice(0, 5) })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onStudentChange(e) {
    this.setData({ studentIndex: Number(e.detail.value) })
    this.loadStats()
  }
})
