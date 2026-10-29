// cloudfunctions/bindGym/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { role, gymId, name, phone } = event

  if (!role || !gymId || !name) {
    return { code: -1, message: '参数不完整' }
  }

  try {
    const existing = await db.collection('users').where({ openid }).get()

    if (existing.data.length > 0) {
      // 更新用户信息
      await db.collection('users').doc(existing.data[0]._id).update({
        data: { role, gymId, name, phone, status: 'pending', updatedAt: db.serverDate() }
      })
    } else {
      // 新建用户
      await db.collection('users').add({
        data: {
          openid,
          role,
          gymId,
          name,
          phone: phone || '',
          status: 'pending',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return {
      code: 0,
      data: { openid, role, gymId, name, status: 'pending' }
    }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
