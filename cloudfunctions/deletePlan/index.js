// cloudfunctions/deletePlan/index.js
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
    if (!user) {
      return { code: -1, message: '用户不存在' }
    }
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId

    const planRes = await db.collection('training_plans').doc(_id).get()
    const plan = planRes.data
    if (!plan) {
      return { code: -1, message: '计划不存在' }
    }
    // 创建者，或本店店长/超管可删除
    const isManager = ['gym_admin', 'super_admin'].includes(user.role) && plan.gymId === gymId
    if (plan.createdBy !== openid && !isManager) {
      return { code: -1, message: '无权删除此计划' }
    }
    await db.collection('training_plans').doc(_id).remove()
    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
