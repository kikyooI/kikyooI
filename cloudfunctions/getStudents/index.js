// cloudfunctions/getStudents/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }
    if (!['coach', 'gym_admin', 'super_admin'].includes(user.role)) {
      return { code: -1, message: '无权限' }
    }

    const res = await db.collection('users')
      .where({ gymId: gymId, role: 'student', status: 'approved' })
      .get()

    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
