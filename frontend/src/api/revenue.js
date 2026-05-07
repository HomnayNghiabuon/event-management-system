import client from './client'

export const getOrganizerRevenue = (from, to) =>
  client.get('/organizer/revenue', { params: { from, to } }).then((r) => r.data)

export const getAdminRevenue = (from, to) =>
  client.get('/admin/revenue', { params: { from, to } }).then((r) => r.data)
