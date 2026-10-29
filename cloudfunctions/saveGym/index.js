// cloudfunctions/saveGym/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id, name, address, phone, description } = event

  try {
    // 权限校验：只有总管理员能操作
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user || user.role !== 'super_admin') {
      return { code: -1, message: '无权限' }
    }

    if (!name) {
      return { code: -1, message: '健身房名称不能为空' }
    }

    const data = {
      name,
      address: address || '',
      phone: phone || '',
      description: description || '',
      updatedAt: db.serverDate()
    }

    if (_id) {
      await db.collection('gyms').doc(_id).update({ data })
    } else {
      data.createdBy = openid
      data.createdAt = db.serverDate()
      await db.collection('gyms').add({ data })
    }

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
