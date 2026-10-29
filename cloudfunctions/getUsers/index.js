// cloudfunctions/getUsers/index.js
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

    const { role, gymId: eventGymId } = event
    let query = {}

    if (!user.gymId && user.role !== 'super_admin') {
      return { code: -1, message: '账号未绑定健身房，请联系店长' }
    }

    // 学员：可查本店教练/店长（用于选择指导教练）和自己
    if (user.role === 'student') {
      if (role === 'coach') {
        // 查"教练"时不看角色本身：教练升为店长后依然可以带课
        // 也不卡 approved：申请店长中的教练（pending_gym_admin）同样是可用教练
        query = {
          gymId: user.gymId,
          role: _.in(['coach', 'gym_admin']),
          status: _.in(['approved', 'pending_gym_admin'])
        }
      } else if (role === 'gym_admin') {
        query = { gymId: user.gymId, role, status: 'approved' }
      } else {
        query = { _id: user._id }
      }
      const selfRes = await db.collection('users').where(query).get()
      return { code: 0, data: selfRes.data }
    }

    // 健身房管理员和教练看本健身房所有用户
    if (user.role === 'gym_admin' || user.role === 'coach') {
      query.gymId = user.gymId
    } else if (user.role === 'super_admin') {
      // 总管理员可看所有，或指定健身房
      if (eventGymId) query.gymId = eventGymId
    } else {
      return { code: -1, message: '无权限' }
    }

    if (role) query.role = role

    const res = await db.collection('users').where(query).get()
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
