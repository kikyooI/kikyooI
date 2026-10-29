// utils/api.js 封装云函数调用
const call = (name, data = {}) => {
  // 超管进入健身房管理模式时，自动带上 gymId
  const app = getApp()
  if (app && app.globalData && app.globalData.role === 'super_admin') {
    const currentGymId = wx.getStorageSync('currentGymId')
    if (currentGymId && !data.gymId) {
      data = { ...data, gymId: currentGymId }
    }
  }

  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        const result = res.result
        if (result.code === 0) {
          resolve(result.data)
        } else {
          wx.showToast({ title: result.message || '请求失败', icon: 'none' })
          reject(new Error(result.message))
        }
      },
      fail: err => {
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = {
  call,
  // 用户
  login: (data) => call('login', data),
  bindGym: (data) => call('bindGym', data),
  getGyms: (data) => call('getGyms', data),
  saveGym: (data) => call('saveGym', data),
  getGymAdmins: (data) => call('getGymAdmins', data),
  saveGymAdmin: (data) => call('saveGymAdmin', data),
  getPendingUsers: (data) => call('getPendingUsers', data),
  approveUser: (data) => call('approveUser', data),
  applyGymAdmin: (data) => call('applyGymAdmin', data),
  updateUser: (data) => call('updateUser', data),
  getUsers: (data) => call('getUsers', data),
  // 训练类型
  getTypes: (data) => call('getTypes', data),
  saveType: (data) => call('saveType', data),
  deleteType: (data) => call('deleteType', data),
  seedData: (data) => call('seedData', data),
  // 训练动作
  getExercises: (data) => call('getExercises', data),
  saveExercise: (data) => call('saveExercise', data),
  deleteExercise: (data) => call('deleteExercise', data),
  // 训练计划
  getPlans: (data) => call('getPlans', data),
  savePlan: (data) => call('savePlan', data),
  deletePlan: (data) => call('deletePlan', data),
  // 训练记录
  getStudents: (data) => call('getStudents', data),
  saveRecord: (data) => call('saveRecord', data),
  getRecords: (data) => call('getRecords', data),
  getRecordDetail: (data) => call('getRecordDetail', data),
  deleteRecord: (data) => call('deleteRecord', data),
  // 统计
  getStats: (data) => call('getStats', data)
}
