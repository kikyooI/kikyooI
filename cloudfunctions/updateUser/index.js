// cloudfunctions/updateUser/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { userId, action } = event

  try {
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]
    if (!user) {
      return { code: -1, message: '用户不存在' }
    }

    // 任何人可修改自己的资料（姓名/电话）
    if (action === 'updateSelf') {
      const { name, phone } = event
      if (!name || !name.trim()) {
        return { code: -1, message: '姓名不能为空' }
      }
      await db.collection('users').doc(user._id).update({
        data: { name: name.trim(), phone: (phone || '').trim(), updatedAt: db.serverDate() }
      })
      return { code: 0, data: null }
    }

    // 只有店长和超管可以操作用户
    if (!['gym_admin', 'super_admin'].includes(user.role)) {
      return { code: -1, message: '无权限' }
    }

    if (!userId || !action) {
      return { code: -1, message: '参数不完整' }
    }

    const targetRes = await db.collection('users').doc(userId).get()
    const target = targetRes.data
    if (!target) {
      return { code: -1, message: '目标用户不存在' }
    }

    // 店长只能操作本店用户
    if (user.role === 'gym_admin' && target.gymId !== user.gymId) {
      return { code: -1, message: '无权操作其他健身房用户' }
    }

    // 不能操作自己
    if (target._id === user._id) {
      return { code: -1, message: '不能操作自己' }
    }

    // 不能操作超管
    if (target.role === 'super_admin') {
      return { code: -1, message: '不能操作超级管理员' }
    }

    let updateData = { updatedAt: db.serverDate() }

    switch (action) {
      case 'setAdmin':
        // 将教练设为管理员
        if (target.role !== 'coach') {
          return { code: -1, message: '只能将教练设为管理员' }
        }
        if (target.status !== 'approved') {
          return { code: -1, message: '该用户未通过审批' }
        }
        updateData.role = 'gym_admin'
        break

      case 'removeAdmin':
        // 移除管理员权限，改回教练
        if (target.role !== 'gym_admin') {
          return { code: -1, message: '该用户不是管理员' }
        }
        updateData.role = 'coach'
        break

      case 'removeUser':
        // 移除学员/教练，设为禁用
        if (target.role === 'gym_admin') {
          return { code: -1, message: '请先移除管理员权限' }
        }
        updateData.status = 'disabled'
        break

      case 'deleteUser':
        // 直接删除用户（不可恢复）
        if (target.role === 'gym_admin') {
          return { code: -1, message: '请先移除管理员权限' }
        }
        await db.collection('users').doc(userId).remove()
        return { code: 0, data: null }

      case 'enableUser':
        // 重新启用用户
        updateData.status = 'approved'
        break

      case 'update': {
        // 超管直接编辑用户资料（姓名/电话/角色/状态/所属健身房）
        if (user.role !== 'super_admin') {
          return { code: -1, message: '仅总管理员可编辑用户' }
        }
        const { name, phone, role, status, gymId } = event
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (role !== undefined) {
          if (!['student', 'coach', 'gym_admin'].includes(role)) {
            return { code: -1, message: '角色不合法' }
          }
          updateData.role = role
        }
        if (status !== undefined) {
          if (!['approved', 'pending', 'rejected', 'disabled'].includes(status)) {
            return { code: -1, message: '状态不合法' }
          }
          updateData.status = status
        }
        if (gymId) updateData.gymId = gymId
        break
      }

      default:
        return { code: -1, message: '未知操作' }
    }

    await db.collection('users').doc(userId).update({ data: updateData })
    return { code: 0, data: null }
  } catch (e) {
    return { code: -1, message: e.message }
  }
}
