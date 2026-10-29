// cloudfunctions/approveUser/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { userId, action } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user) {
      return { code: -1, message: '用户不存在' }
    }

    if (!userId || !action) {
      return { code: -1, message: '参数不完整' }
    }

    const targetRes = await db.collection('users').doc(userId).get()
    const target = targetRes.data
    if (!target) {
      return { code: -1, message: '目标用户不存在' }
    }

    const status = action === 'approve' ? 'approved' : 'rejected'

    // 权限校验
    if (user.role === 'super_admin') {
      // 超管可以审批所有
    } else if (user.role === 'gym_admin') {
      // 店长只能审批本健身房的教练和学员
      if (target.gymId !== user.gymId) {
        return { code: -1, message: '无权操作用户' }
      }
      if (target.status === 'pending_gym_admin') {
        return { code: -1, message: '店长申请需超管审批' }
      }
    } else if (user.role === 'coach') {
      // 教练只能审批本健身房的学员
      if (target.gymId !== user.gymId || target.role !== 'student') {
        return { code: -1, message: '教练只能审批学员' }
      }
    } else {
      return { code: -1, message: '无权限' }
    }

    // 如果是店长申请且通过，角色改为 gym_admin
    const updateData = { status, updatedAt: db.serverDate() }
    if (target.status === 'pending_gym_admin' && action === 'approve') {
      updateData.role = 'gym_admin'
    }

    await db.collection('users').doc(userId).update({ data: updateData })
    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
