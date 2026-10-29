// pages/super-admin/gym-admins/gym-admins.js
const api = require('../../../utils/api.js')

Page({
  data: {
    gymId: '',
    admins: [],
    loading: false
  },

  onLoad(options) {
    if (options.gymId) {
      this.setData({ gymId: options.gymId })
    }
  },

  onShow() {
    this.loadAdmins()
  },

  async loadAdmins() {
    this.setData({ loading: true })
    try {
      const admins = await api.getGymAdmins({ gymId: this.data.gymId })
      this.setData({ admins })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  }
})
