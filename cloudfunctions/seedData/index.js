// cloudfunctions/seedData/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const DEFAULT_DATA = [
  {
    name: '胸部训练',
    exercises: ['杠铃卧推', '史密斯推胸', '哑铃飞鸟', '上斜哑铃卧推', '龙门架夹胸', '哑铃卧推', '双杠臂屈伸']
  },
  {
    name: '背部训练',
    exercises: ['引体向上', '高位下拉', '坐姿划船', '硬拉', '单臂哑铃划船', '杠铃划船', '直臂下压']
  },
  {
    name: '肩部训练',
    exercises: ['哑铃推举', '侧平举', '俯身飞鸟', '面拉', '阿诺德推举', '杠铃推举', '反向飞鸟']
  },
  {
    name: '腿部训练',
    exercises: ['深蹲', '腿举', '罗马尼亚硬拉', '腿屈伸', '腿弯举', '箭步蹲', '小腿提踵']
  },
  {
    name: '功能性训练',
    exercises: ['波比跳', '壶铃摆动', '战绳', 'TRX划船', '农夫行走', '药球砸地', '敏捷梯']
  }
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }
    if (!['coach', 'gym_admin', 'super_admin'].includes(user.role)) {
      return { code: -1, message: '无权限' }
    }

    // 检查是否已初始化
    const existing = await db.collection('training_types').where({ gymId }).count()
    if (existing.total > 0) {
      return { code: -1, message: '该健身房已初始化训练类型，请勿重复导入' }
    }

    const now = db.serverDate()
    let typeCount = 0
    let exerciseCount = 0

    for (const type of DEFAULT_DATA) {
      // 创建训练类型
      const typeRes = await db.collection('training_types').add({
        data: {
          name: type.name,
          gymId,
          createdBy: openid,
          createdAt: now,
          updatedAt: now
        }
      })
      typeCount++

      const typeId = typeRes._id

      // 批量创建动作
      for (const exName of type.exercises) {
        await db.collection('exercises').add({
          data: {
            name: exName,
            typeId,
            gymId,
            description: '',
            createdBy: openid,
            createdAt: now,
            updatedAt: now
          }
        })
        exerciseCount++
      }
    }

    return {
      code: 0,
      data: { typeCount, exerciseCount },
      message: `成功导入 ${typeCount} 个训练类型，${exerciseCount} 个动作`
    }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
