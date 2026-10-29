// cloudfunctions/applyGymAdmin/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user) {
      return { code: -1, message: '用户不存在' }
    }
    if (user.role !== 'coach') {
      return { code: -1, message: '只有教练可以申请' }
    }
    if (user.status !== 'approved') {
      return { code: -1, message: '账号状态异常' }
    }

    await db.collection('users').doc(user._id).update({
      data: { status: 'pending_gym_admin', updatedAt: db.serverDate() }
    })

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
