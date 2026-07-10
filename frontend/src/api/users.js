import client from './client'

export const getMe = () =>
  client.get('/users/me').then((r) => r.data)

export const updateMe = (data) =>
  client.patch('/users/me', data).then((r) => r.data)
