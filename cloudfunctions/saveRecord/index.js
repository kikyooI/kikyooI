// cloudfunctions/saveRecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { _id, studentId, studentName, trainingDate, typeId, typeName, planId, items, notes } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    let gymId = user.gymId
    if (user.role === 'super_admin' && event.gymId) gymId = event.gymId
    if (!user || !gymId) {
      return { code: -1, message: '请先绑定健身房' }
    }
    if (!items || items.length === 0) {
      return { code: -1, message: '训练内容不能为空' }
    }

    if (_id) {
      // 编辑：学员本人，或本店教练/店长/超管
      const recRes = await db.collection('training_records').doc(_id).get()
      const rec = recRes.data
      if (!rec) {
        return { code: -1, message: '记录不存在' }
      }
      const isOwner = rec.studentId === openid
      const isStaff = ['coach', 'gym_admin', 'super_admin'].includes(user.role) && rec.gymId === gymId
      if (!isOwner && !isStaff) {
        return { code: -1, message: '无权修改此记录' }
      }
      await db.collection('training_records').doc(_id).update({
        data: {
          trainingDate: trainingDate || rec.trainingDate,
          typeId: typeId || '',
          typeName: typeName || '',
          items,
          notes: notes || '',
          updatedAt: db.serverDate()
        }
      })
    } else {
      // 新建：教练/店长/超管可为任意学员记；学员只能为自己记
      const isStudent = user.role === 'student'
      if (!isStudent && !['coach', 'gym_admin', 'super_admin'].includes(user.role)) {
        return { code: -1, message: '无权限' }
      }
      const sid = isStudent ? openid : studentId
      const sname = isStudent ? user.name : studentName
      if (!sid) {
        return { code: -1, message: '学员不能为空' }
      }
      // 学员自助记训可指定指导教练（须为本店教练/店长）
      let coachId = isStudent ? null : openid
      let coachName = isStudent ? null : user.name
      if (isStudent && event.coachId) {
        const coachRes = await db.collection('users')
          .where({ openid: event.coachId, gymId, status: 'approved' })
          .get()
        const coach = coachRes.data.find(u => ['coach', 'gym_admin'].includes(u.role))
        if (coach) {
          coachId = coach.openid
          coachName = coach.name
        }
      }
      const now = db.serverDate()
      await db.collection('training_records').add({
        data: {
          gymId,
          studentId: sid,
          studentName: sname,
          coachId,
          coachName,
          trainingDate: trainingDate || new Date().toISOString().slice(0, 10),
          typeId: typeId || '',
          typeName: typeName || '',
          planId: planId || '',
          items,
          notes: notes || '',
          createdAt: now,
          updatedAt: now
        }
      })
    }

    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
