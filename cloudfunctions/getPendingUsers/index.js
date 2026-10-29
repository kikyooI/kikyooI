// cloudfunctions/getPendingUsers/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user) {
      return { code: -1, message: '用户不存在' }
    }

    let query = {}
    let roleQuery

    if (user.role === 'super_admin') {
      // 超管进入某店管理模式时只看本店，否则看所有健身房
      if (event.gymId) {
        query = { gymId: event.gymId }
      }
      roleQuery = _.or([
        { role: _.in(['coach', 'student']), status: 'pending' },
        { role: 'coach', status: 'pending_gym_admin' }
      ])
    } else if (user.role === 'gym_admin') {
      // 店长：本健身房的教练和学员
      query = { gymId: user.gymId }
      roleQuery = { role: _.in(['coach', 'student']), status: 'pending' }
    } else if (user.role === 'coach') {
      // 教练：本健身房的学员
      query = { gymId: user.gymId }
      roleQuery = { role: 'student', status: 'pending' }
    } else {
      return { code: -1, message: '无权限' }
    }

    const res = await db.collection('users').where(_.and([query, roleQuery])).get()
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
