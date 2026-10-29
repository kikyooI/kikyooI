// cloudfunctions/getRecords/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { studentId, startDate, endDate, typeId, page = 1, pageSize = 20 } = event

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
      // 学员只能看自己的
      query.studentId = openid
    } else if (studentId) {
      // 教练/管理员指定学员
      query.studentId = studentId
    }

    if (typeId) query.typeId = typeId
    if (startDate && endDate) {
      query.trainingDate = _.gte(startDate).and(_.lte(endDate))
    }

    const res = await db.collection('training_records')
      .where(query)
      .orderBy('trainingDate', 'desc')
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
