// cloudfunctions/saveGymAdmin/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id, gymId, name, phone, openid: adminOpenid } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user || user.role !== 'super_admin') {
      return { code: -1, message: '无权限' }
    }

    if (!gymId || !name || !adminOpenid) {
      return { code: -1, message: '参数不完整' }
    }

    // 检查该 openid 是否已注册
    const existRes = await db.collection('users').where({ openid: adminOpenid }).get()

    if (_id) {
      await db.collection('users').doc(_id).update({
        data: { gymId, name, phone: phone || '', role: 'gym_admin', status: 'approved', updatedAt: db.serverDate() }
      })
    } else if (existRes.data.length > 0) {
      await db.collection('users').doc(existRes.data[0]._id).update({
        data: { gymId, name, phone: phone || '', role: 'gym_admin', status: 'approved', updatedAt: db.serverDate() }
      })
    } else {
      await db.collection('users').add({
        data: {
          openid: adminOpenid,
          gymId,
          name,
          phone: phone || '',
          role: 'gym_admin',
          status: 'approved',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
