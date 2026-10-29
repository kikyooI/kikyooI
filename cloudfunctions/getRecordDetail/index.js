// cloudfunctions/getRecordDetail/index.js
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

    const res = await db.collection('training_records').doc(_id).get()
    const record = res.data

    // 学员只能看自己的
    if (user.role === 'student' && record.studentId !== openid) {
      return { code: -1, message: '无权查看此记录' }
    }
    // 教练/管理员只能看本健身房的
    if (['coach', 'gym_admin'].includes(user.role) && record.gymId !== user.gymId) {
      return { code: -1, message: '无权查看此记录' }
    }

    return { code: 0, data: record }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
