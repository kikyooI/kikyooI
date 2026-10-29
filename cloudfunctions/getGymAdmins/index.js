// cloudfunctions/getGymAdmins/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user || user.role !== 'super_admin') {
      return { code: -1, message: '无权限' }
    }

    const { gymId } = event
    let query = { role: 'gym_admin' }
    if (gymId) query.gymId = gymId

    const res = await db.collection('users').where(query).get()
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
