// pages/gym-admin/user-edit/user-edit.js
const api = require('../../../utils/api.js')

const ROLES = [
  { value: 'student', label: '学员' },
  { value: 'coach', label: '教练' },
  { value: 'gym_admin', label: '管理员' }
]

const STATUS_LIST = [
  { value: 'approved', label: '正常' },
  { value: 'pending', label: '待审批' },
  { value: 'rejected', label: '已驳回' },
  { value: 'disabled', label: '已禁用' }
]

Page({
  data: {
    userId: '',
    name: '',
    phone: '',
    roles: ROLES,
    roleIndex: 0,
    statusList: STATUS_LIST,
    statusIndex: 0,
    gyms: [],
    gymIndex: 0,
    saving: false
  },

  async onLoad(options) {
    this.setData({ userId: options.id })
    try {
      const [users, gyms] = await Promise.all([api.getUsers(), api.getGyms()])
      const target = users.find(u => u._id === options.id)
      if (!target) {
        wx.showToast({ title: '用户不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 800)
        return
      }
      this.setData({
        name: target.name || '',
        phone: target.phone || '',
        roleIndex: Math.max(0, ROLES.findIndex(r => r.value === target.role)),
        statusIndex: Math.max(0, STATUS_LIST.findIndex(s => s.value === target.status)),
        gyms,
        gymIndex: Math.max(0, gyms.findIndex(g => g._id === target.gymId))
      })
    } catch (e) {
      console.error(e)
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onRoleChange(e) {
    this.setData({ roleIndex: Number(e.detail.value) })
  },

  onStatusChange(e) {
    this.setData({ statusIndex: Number(e.detail.value) })
  },

  onGymChange(e) {
    this.setData({ gymIndex: Number(e.detail.value) })
  },

  async submit() {
    const { userId, name, phone, roles, roleIndex, statusList, statusIndex, gyms, gymIndex } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '姓名不能为空', icon: 'none' })
      return
    }
    const params = {
      userId,
      action: 'update',
      name: name.trim(),
      phone: phone.trim(),
      role: roles[roleIndex].value,
      status: statusList[statusIndex].value
    }
    if (gyms[gymIndex]) params.gymId = gyms[gymIndex]._id

    this.setData({ saving: true })
    try {
      await api.updateUser(params)
      wx.showToast({ title: '已保存' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      wx.showToast({ title: e.message || '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
})
