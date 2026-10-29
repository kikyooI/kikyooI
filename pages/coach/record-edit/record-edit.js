// pages/coach/record-edit/record-edit.js
const api = require('../../../utils/api.js')
const app = getApp()

Page({
  data: {
    _id: '',
    isEdit: false,
    isStudent: false,
    studentId: '',
    studentName: '',
    students: [],
    studentIndex: 0,
    plans: [],
    planIndex: 0,
    planId: '',
    coaches: [],
    coachIndex: 0,
    types: [],
    typeIndex: 0,
    typeId: '',
    typeName: '',
    exercises: [],
    items: [], // { exerciseId, name, sets:[{reps,weight}], notes }
    notes: '',
    trainingDate: '',
    loading: false
  },

  onLoad(options) {
    const today = new Date().toISOString().slice(0, 10)
    const isStudent = app.globalData.role === 'student'
    this.setData({ trainingDate: today, isStudent })
    if (options.id) {
      // 编辑模式
      this.setData({ _id: options.id, isEdit: true })
      this.loadRecord(options.id)
    } else if (isStudent) {
      // 学员自助记训：固定为本人
      this.setData({ studentId: app.globalData.openid, studentName: app.globalData.name })
      this.loadPlans()
      this.loadCoaches()
    } else {
      this.loadStudents()
    }
    this.loadTypes()
  },

  async loadRecord(id) {
    try {
      const rec = await api.getRecordDetail({ _id: id })
      const items = (rec.items || []).map(it => ({
        _id: Date.now() + '_' + Math.random(),
        exerciseId: it.exerciseId,
        name: it.name,
        sets: (it.sets && it.sets.length > 0 ? it.sets : [{ reps: '', weight: '' }])
          .map(s => ({ reps: s.reps, weight: s.weight })),
        notes: it.notes || ''
      }))
      this.setData({
        studentId: rec.studentId,
        studentName: rec.studentName,
        trainingDate: rec.trainingDate,
        typeId: rec.typeId || '',
        typeName: rec.typeName || '',
        items,
        notes: rec.notes || ''
      }, () => {
        this.matchType()
        if (this.data.typeId) this.loadExercises()
      })
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '记录加载失败', icon: 'none' })
    }
  },

  async loadStudents() {
    try {
      const students = await api.getStudents()
      this.setData({ students })
      if (!this.data.isEdit) this.loadPlans()
    } catch (e) {
      console.error(e)
    }
  },

  // 加载当前选中学员的计划（新建模式）
  async loadPlans() {
    const students = this.data.students
    const sid = this.data.isStudent
      ? app.globalData.openid
      : (students.length > 0 ? students[this.data.studentIndex].openid : '')
    if (!sid) {
      this.setData({ plans: [] })
      return
    }
    try {
      const list = await api.getPlans({ studentId: sid })
      this.setData({
        plans: [{ _id: '', name: '不使用计划' }, ...list],
        planIndex: 0,
        planId: ''
      })
    } catch (e) {
      console.error(e)
    }
  },

  // 学员模式：加载本店教练列表（可选指导教练）
  async loadCoaches() {
    try {
      const coaches = await api.getUsers({ role: 'coach' })
      this.setData({ coaches: [{ openid: '', name: '不选择教练' }, ...coaches] })
      if (coaches.length === 0) {
        wx.showToast({ title: '本店暂无可选教练', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
    }
  },

  onCoachChange(e) {
    this.setData({ coachIndex: Number(e.detail.value) })
  },

  onPlanChange(e) {
    const idx = Number(e.detail.value)
    const plan = this.data.plans[idx]
    this.setData({ planIndex: idx, planId: plan && plan._id ? plan._id : '' })
    if (!plan || !plan._id) return
    // 按计划填充动作和组数
    const items = (plan.items || []).map(it => ({
      _id: Date.now() + '_' + Math.random(),
      exerciseId: it.exerciseId,
      name: it.name,
      sets: Array.from({ length: it.sets || 1 }, () => ({ reps: '', weight: '' })),
      notes: ''
    }))
    this.setData({
      items,
      typeId: plan.typeId || this.data.typeId
    }, () => {
      this.matchType()
      if (this.data.typeId) this.loadExercises()
    })
  },

  async loadTypes() {
    try {
      const types = await api.getTypes()
      this.setData({ types })
      if (this.data.typeId) {
        // 编辑模式：定位到已有类型
        this.matchType()
      } else if (types.length > 0) {
        this.setData({ typeId: types[0]._id, typeName: types[0].name })
        this.loadExercises()
      }
    } catch (e) {
      console.error(e)
    }
  },

  matchType() {
    const { types, typeId } = this.data
    if (!typeId || types.length === 0) return
    const idx = types.findIndex(t => t._id === typeId)
    if (idx >= 0) this.setData({ typeIndex: idx, typeName: types[idx].name })
  },

  async loadExercises() {
    try {
      const exercises = await api.getExercises({ typeId: this.data.typeId })
      this.setData({ exercises })
    } catch (e) {
      console.error(e)
    }
  },

  onStudentChange(e) {
    this.setData({ studentIndex: Number(e.detail.value) })
    this.loadPlans()
  },

  onTypeChange(e) {
    const idx = Number(e.detail.value)
    const type = this.data.types[idx]
    this.setData({ typeIndex: idx, typeId: type._id, typeName: type.name })
    this.loadExercises()
  },

  onDateChange(e) {
    this.setData({ trainingDate: e.detail.value })
  },

  onExercisePick(e) {
    const ex = this.data.exercises[Number(e.detail.value)]
    if (!ex) return
    const newItems = [...this.data.items, {
      _id: Date.now() + '_' + Math.random(),
      exerciseId: ex._id,
      name: ex.name,
      sets: [{ reps: '', weight: '' }],
      notes: ''
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

  onAddSet(e) {
    const idx = e.currentTarget.dataset.idx
    const items = this.data.items
    items[idx].sets.push({ reps: '', weight: '' })
    this.setData({ items: [...items] })
  },

  onRemoveSet(e) {
    const { itemIdx, setIdx } = e.currentTarget.dataset
    const items = this.data.items
    items[itemIdx].sets.splice(setIdx, 1)
    this.setData({ items: [...items] })
  },

  onSetInput(e) {
    const { itemIdx, setIdx, field } = e.currentTarget.dataset
    const items = this.data.items
    items[itemIdx].sets[setIdx][field] = e.detail.value
    this.setData({ items: [...items] })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  async submit() {
    const { _id, isEdit, students, studentIndex, studentId, studentName, items, notes, trainingDate, typeId, typeName } = this.data

    let sid = studentId
    let sname = studentName
    if (!isEdit) {
      if (this.data.isStudent) {
        sid = app.globalData.openid
        sname = app.globalData.name
      } else {
        if (students.length === 0) {
          wx.showToast({ title: '暂无学员', icon: 'none' })
          return
        }
        const student = students[studentIndex]
        sid = student.openid
        sname = student.name
      }
    }

    if (items.length === 0) {
      wx.showToast({ title: '请添加训练动作', icon: 'none' })
      return
    }

    // 校验数据
    for (let item of items) {
      for (let set of item.sets) {
        if (!set.reps) {
          wx.showToast({ title: '请填写每组个数', icon: 'none' })
          return
        }
      }
    }

    const submitItems = items.map(it => ({
      exerciseId: it.exerciseId,
      name: it.name,
      sets: it.sets.map(s => ({ reps: Number(s.reps), weight: s.weight ? Number(s.weight) : 0 })),
      notes: it.notes
    }))

    this.setData({ loading: true })
    try {
      // 学员自助记训：带上所选指导教练
      let coachId
      let coachName
      if (!isEdit && this.data.isStudent) {
        const coach = this.data.coaches[this.data.coachIndex]
        if (coach && coach.openid) {
          coachId = coach.openid
          coachName = coach.name
        }
      }
      await api.saveRecord({
        _id: _id || undefined,
        studentId: sid,
        studentName: sname,
        coachId,
        coachName,
        trainingDate,
        typeId,
        typeName,
        planId: this.data.planId || undefined,
        items: submitItems,
        notes
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
