import client from './client'

export const getMyTickets = () =>
  client.get('/tickets/my').then((r) => r.data)

export const fetchQrImage = (qrCode) =>
  client.get(`/tickets/${qrCode}/qr-image`, { responseType: 'blob' })
    .then((r) => URL.createObjectURL(r.data))

export const checkin = (qrCode) =>
  client.post(`/tickets/${qrCode}/checkin`).then((r) => r.data)
