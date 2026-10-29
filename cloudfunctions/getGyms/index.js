// cloudfunctions/getGyms/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 检查是否为总管理员
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let query = {}

    // 非总管理员只能看到自己的健身房
    if (!user || user.role !== 'super_admin') {
      if (user && user.gymId) {
        query = { _id: user.gymId }
      }
    }

    const res = await db.collection('gyms').where(query).orderBy('createdAt', 'desc').get()
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
