import client from './client'

export const getEvents = (params) =>
  client.get('/events', { params }).then((r) => r.data)

export const getEventById = (id) =>
  client.get(`/events/${id}`).then((r) => r.data)

export const createEvent = (data) =>
  client.post('/events', data).then((r) => r.data)

export const updateEvent = (id, data) =>
  client.put(`/events/${id}`, data).then((r) => r.data)

export const publishEvent = (id, publish) =>
  client.patch(`/events/${id}/publish`, { publish }).then((r) => r.data)

export const deleteEvent = (id) =>
  client.delete(`/events/${id}`)

export const getMyEvents = (page = 0, size = 10) =>
  client.get('/events/my', { params: { page, size } }).then((r) => r.data)

export const getEventStats = (id) =>
  client.get(`/events/${id}/stats`).then((r) => r.data)

export const getEventAttendees = (id) =>
  client.get(`/events/${id}/attendees`).then((r) => r.data)

export const sendEventNotification = (id, data) =>
  client.post(`/events/${id}/notify`, data).then((r) => r.data)
