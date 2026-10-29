// cloudfunctions/getStats/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { studentId, exerciseId, startDate, endDate } = event

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
      query.studentId = openid
    } else if (studentId) {
      query.studentId = studentId
    }

    if (startDate && endDate) {
      query.trainingDate = _.gte(startDate).and(_.lte(endDate))
    }

    // 获取所有记录
    const recordsRes = await db.collection('training_records')
      .where(query)
      .orderBy('trainingDate', 'asc')
      .get()
    const records = recordsRes.data

    // 1. 训练频率（按日期）
    const freqMap = {}
    // 2. 类型分布
    const typeMap = {}
    // 3. 动作重量趋势
    const exerciseTrend = {} // exerciseId -> [{date, maxWeight}]

    records.forEach(r => {
      // 频率
      freqMap[r.trainingDate] = (freqMap[r.trainingDate] || 0) + 1

      // 类型分布
      if (r.typeName) {
        typeMap[r.typeName] = (typeMap[r.typeName] || 0) + 1
      }

      // 动作重量趋势
      r.items.forEach(item => {
        if (item.sets && item.sets.length > 0) {
          const maxWeight = Math.max(...item.sets.map(s => Number(s.weight) || 0))
          const key = item._id || item.exerciseId || item.name
          if (!exerciseTrend[key]) {
            exerciseTrend[key] = { name: item.name, data: [] }
          }
          exerciseTrend[key].data.push({
            date: r.trainingDate,
            weight: maxWeight,
            maxReps: Math.max(...item.sets.map(s => Number(s.reps) || 0))
          })
        }
      })
    })

    const frequency = Object.keys(freqMap).sort().map(d => ({ date: d, count: freqMap[d] }))
    const typeDist = Object.keys(typeMap).map(t => ({ name: t, count: typeMap[t] }))

    // 如果指定了动作，只返回该动作的趋势
    let trendResult = exerciseTrend
    if (exerciseId) {
      trendResult = exerciseTrend[exerciseId] ? { [exerciseId]: exerciseTrend[exerciseId] } : {}
    }

    return {
      code: 0,
      data: {
        totalRecords: records.length,
        frequency,
        typeDist,
        exerciseTrend: trendResult
      }
    }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
