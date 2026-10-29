// cloudfunctions/deleteType/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!['coach', 'gym_admin', 'super_admin'].includes(user.role)) {
      return { code: -1, message: '无权限' }
    }
    await db.collection('training_types').doc(_id).remove()
    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
