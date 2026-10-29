// cloudfunctions/savePlan/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id, name, typeId, items, assignedTo, assignedToName, planDate } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }
    if (!name) {
      return { code: -1, message: '计划名称不能为空' }
    }

    const data = {
      name,
      typeId: typeId || '',
      items: items || [],
      planDate: planDate || new Date().toISOString().slice(0, 10),
      updatedAt: db.serverDate()
    }

    if (_id) {
      // 修改：创建者、被分配者，或本店店长/超管可修改
      const planRes = await db.collection('training_plans').doc(_id).get()
      const plan = planRes.data
      if (!plan) {
        return { code: -1, message: '计划不存在' }
      }
      const isManager = ['gym_admin', 'super_admin'].includes(user.role) && plan.gymId === gymId
      if (plan.createdBy !== openid && plan.assignedTo !== openid && !isManager) {
        return { code: -1, message: '无权修改此计划' }
      }

      // 教练、店长、超管能分配计划
      if (['coach', 'gym_admin', 'super_admin'].includes(user.role)) {
        if (!assignedTo) {
          return { code: -1, message: '请选择学员，计划必须分配给个人' }
        }
        data.assignedTo = assignedTo
        data.assignedToName = assignedToName || ''
      }

      await db.collection('training_plans').doc(_id).update({ data })
    } else {
      // 新建：计划必须分配给个人
      if (!assignedTo) {
        return { code: -1, message: '请选择学员，计划必须分配给个人' }
      }
      // 学员只能给自己创建
      if (user.role === 'student' && assignedTo !== openid) {
        return { code: -1, message: '只能给自己创建计划' }
      }

      data.gymId = gymId
      data.createdBy = openid
      data.createdByName = user.name
      data.createdAt = db.serverDate()
      data.assignedTo = assignedTo
      data.assignedToName = assignedToName || ''

      await db.collection('training_plans').add({ data })
    }

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
