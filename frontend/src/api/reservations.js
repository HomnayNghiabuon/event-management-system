import client from './client'

export const reserve = (ticketTypeId, quantity) =>
  client.post('/reservations/reserve', { ticketTypeId, quantity }).then((r) => r.data)

export const purchase = (reservationId, paymentMethod) =>
  client.post('/reservations/purchase', { reservationId, paymentMethod }).then((r) => r.data)

export const getMyReservations = (page = 0, size = 10) =>
  client.get('/reservations/my', { params: { page, size } }).then((r) => r.data)

export const cancelReservation = (id) =>
  client.delete(`/reservations/${id}`)
