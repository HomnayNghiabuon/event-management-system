import client from './client'

// Events
export const getAdminEvents = (params) =>
  client.get('/admin/events', { params }).then((r) => r.data)

export const reviewEvent = (eventId, action, reason) =>
  client.patch(`/admin/events/${eventId}/approval`, { action, reason }).then((r) => r.data)

// Organizers
export const getOrganizers = (params) =>
  client.get('/admin/organizers', { params }).then((r) => r.data)

export const getOrganizerById = (id) =>
  client.get(`/admin/organizers/${id}`).then((r) => r.data)

export const createOrganizer = (data) =>
  client.post('/admin/organizers', data).then((r) => r.data)

export const updateOrganizer = (id, data) =>
  client.put(`/admin/organizers/${id}`, data).then((r) => r.data)

export const deleteOrganizer = (id) =>
  client.delete(`/admin/organizers/${id}`)

// Stats
export const getAdminStats = () =>
  client.get('/admin/stats').then((r) => r.data)

// User status
export const setUserStatus = (userId, active) =>
  client.patch(`/admin/users/${userId}/status`, null, { params: { active } })

// Commissions
export const getCommissions = () =>
  client.get('/admin/commissions').then((r) => r.data)

export const getActiveCommission = () =>
  client.get('/admin/commissions/active').then((r) => r.data)

export const createCommission = (data) =>
  client.post('/admin/commissions', data).then((r) => r.data)

export const updateCommission = (id, data) =>
  client.patch(`/admin/commissions/${id}`, data).then((r) => r.data)
