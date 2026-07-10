import client from './client'

export const getNotifications = (page = 0, size = 20) =>
  client.get('/notifications', { params: { page, size } }).then((r) => r.data)

export const getUnreadCount = () =>
  client.get('/notifications/unread-count').then((r) => r.data)

export const markAsRead = (id) =>
  client.patch(`/notifications/${id}/read`)

export const markAllAsRead = () =>
  client.patch('/notifications/read-all')
