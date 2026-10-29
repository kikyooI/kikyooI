// cloudfunctions/getPlans/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { studentId } = event // 教练查看某学员的计划时传

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }

    let query = { gymId: gymId }

    if (user.role === 'student') {
      // 学员：公共计划 + 自己创建的 + 分配给自己的
      query = _.and([
        { gymId: gymId },
        _.or([
          { assignedTo: null },
          { createdBy: openid },
          { assignedTo: openid }
        ])
      ])
    } else if (['coach', 'gym_admin', 'super_admin'].includes(user.role) && studentId) {
      // 教练/店长/超管查看某学员：该学员的计划
      query = _.and([
        { gymId: gymId },
        _.or([
          { assignedTo: studentId },
          { createdBy: studentId }
        ])
      ])
    } else if (user.role === 'coach') {
      // 教练查看所有计划
    }

    const res = await db.collection('training_plans')
      .where(query)
      .orderBy('createdAt', 'desc')
      .get()

    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
