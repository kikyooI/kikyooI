// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查找用户
    const res = await db.collection('users').where({ openid }).get()

    if (res.data.length === 0) {
      // 新用户，返回需要注册
      return {
        code: 0,
        data: {
          openid,
          isNew: true,
          role: null,
          status: 'pending'
        }
      }
    }

    const user = res.data[0]
    return {
      code: 0,
      data: {
        openid,
        isNew: false,
        role: user.role,
        status: user.status,
        gymId: user.gymId,
        name: user.name,
        phone: user.phone
      }
    }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
