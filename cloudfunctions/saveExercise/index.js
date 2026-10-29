// cloudfunctions/saveExercise/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id, name, typeId, description } = event

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
    if (!name || !typeId) {
      return { code: -1, message: '名称和类型不能为空' }
    }

    const data = { name, typeId, description: description || '', updatedAt: db.serverDate() }
    if (_id) {
      await db.collection('exercises').doc(_id).update({ data })
    } else {
      data.gymId = gymId
      data.createdBy = openid
      data.createdAt = db.serverDate()
      await db.collection('exercises').add({ data })
    }

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
