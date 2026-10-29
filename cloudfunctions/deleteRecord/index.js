// cloudfunctions/deleteRecord/index.js
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
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }
    if (!_id) {
      return { code: -1, message: '参数不完整' }
    }

    const recRes = await db.collection('training_records').doc(_id).get()
    const rec = recRes.data
    if (!rec) {
      return { code: -1, message: '记录不存在' }
    }

    // 权限：学员本人，或本店教练/店长/超管
    const isOwner = rec.studentId === openid
    const isStaff = ['coach', 'gym_admin', 'super_admin'].includes(user.role) && rec.gymId === gymId
    if (!isOwner && !isStaff) {
      return { code: -1, message: '无权删除此记录' }
    }

    await db.collection('training_records').doc(_id).remove()
    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
