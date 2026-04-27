import client from './client'

export const getMyOrders = (page = 0, size = 10) =>
  client.get('/orders/my', { params: { page, size } }).then((r) => r.data)

export const getOrderById = (id) =>
  client.get(`/orders/${id}`).then((r) => r.data)

export const cancelOrder = (id) =>
  client.post(`/orders/${id}/cancel`)
