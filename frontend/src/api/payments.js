import client from './client'

export const createPayment = (reservationId, paymentMethod, attendeeNames = []) =>
  client
    .post('/payments/create', { reservationId, paymentMethod, attendeeNames })
    .then((r) => r.data)

export const getOrderByCode = (code) =>
  client.get(`/orders/by-code/${code}`).then((r) => r.data)
