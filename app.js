// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d0guexcgk7b75b1e8', // TODO: 替换为你的云开发环境ID
        traceUser: true
      })
    }
    this.globalData = {
      userInfo: null,
      openid: null,
      role: null,
      gymId: null,
      status: null,
      name: null
    }
  },

  // 检查登录状态
  checkLogin() {
    return new Promise((resolve, reject) => {
      const openid = wx.getStorageSync('openid')
      const role = wx.getStorageSync('role')
      if (openid && role) {
        this.globalData.openid = openid
        this.globalData.role = role
        this.globalData.gymId = wx.getStorageSync('gymId')
        this.globalData.status = wx.getStorageSync('status')
        this.globalData.name = wx.getStorageSync('name')
        resolve()
      } else {
        reject('not login')
      }
    })
  },

  // 保存登录信息
  setLogin(data) {
    this.globalData.openid = data.openid
    this.globalData.role = data.role
    this.globalData.gymId = data.gymId
    this.globalData.status = data.status
    this.globalData.name = data.name
    wx.setStorageSync('openid', data.openid)
    wx.setStorageSync('role', data.role)
    wx.setStorageSync('gymId', data.gymId)
    wx.setStorageSync('status', data.status)
    wx.setStorageSync('name', data.name)
  },

  // 退出登录
  logout() {
    this.globalData = {
      userInfo: null,
      openid: null,
      role: null,
      gymId: null,
      status: null,
      name: null
    }
    wx.clearStorageSync()
    wx.reLaunch({ url: '/pages/login/login' })
  },

  // 根据角色跳转首页
  goHome() {
    const role = this.globalData.role
    const status = this.globalData.status
    if (status === 'pending') {
      wx.showModal({
        title: '待审批',
        content: '您的账号正在等待审批，请耐心等待。',
        showCancel: false
      })
      return
    }
    if (status === 'pending_gym_admin') {
      wx.showModal({
        title: '店长申请审批中',
        content: '您的店长申请正在等待总管理员审批，请耐心等待。',
        showCancel: false
      })
      return
    }
    if (status === 'rejected' || status === 'disabled') {
      wx.showModal({
        title: '账号不可用',
        content: status === 'rejected'
          ? '您的申请已被驳回，可修改资料后重新提交。'
          : '您的账号已被禁用，可重新提交申请等待审批。',
        confirmText: '重新申请',
        cancelText: '退出登录',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/select-role/select-role?reapply=1' })
          } else {
            this.logout()
          }
        }
      })
      return
    }
    let url = ''
    switch (role) {
      case 'super_admin':
        url = '/pages/super-admin/gyms/gyms'
        break
      case 'gym_admin':
        url = '/pages/gym-admin/dashboard/dashboard'
        break
      case 'coach':
        url = '/pages/coach/dashboard/dashboard'
        break
      case 'student':
        url = '/pages/student/records/records'
        break
      default:
        url = '/pages/login/login'
    }
    wx.reLaunch({ url })
  }
})
