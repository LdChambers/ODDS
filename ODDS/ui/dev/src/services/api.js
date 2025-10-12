import { api } from 'src/boot/axios'

// Helper to build query string from params
const buildQuery = (params) => {
  const query = new URLSearchParams()
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key])
    }
  })
  return query.toString()
}

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
}

// Students API
export const studentsAPI = {
  list: (params) => api.get(`/students?${buildQuery(params)}`),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  processCertificate: (id) => api.post(`/students/${id}/process-certificate`),
  emailCertificate: (id) => api.post(`/students/${id}/email-certificate`)
}

// Classes API
export const classesAPI = {
  list: (params) => api.get(`/classes?${buildQuery(params)}`),
  get: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  enroll: (id, studentData) => api.post(`/classes/${id}/enroll`, studentData),
  getQRCode: (id) => api.get(`/classes/${id}/qr-code`),
  processAll: (id) => api.post(`/classes/${id}/process-all`),
  emailCertificates: (id) => api.post(`/classes/${id}/email-certificates`),
  recordPayment: (id, paymentData) => api.post(`/classes/${id}/record-payment`, paymentData)
}

// Instructors API
export const instructorsAPI = {
  list: (params) => api.get(`/instructors?${buildQuery(params)}`),
  get: (id) => api.get(`/instructors/${id}`),
  create: (data) => api.post('/instructors', data),
  update: (id, data) => api.put(`/instructors/${id}`, data),
  delete: (id) => api.delete(`/instructors/${id}`)
}

// Locations API
export const locationsAPI = {
  list: (params) => api.get(`/locations?${buildQuery(params)}`),
  get: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`)
}

// Courses API
export const coursesAPI = {
  list: () => api.get('/courses'),
  get: (id) => api.get(`/courses/${id}`)
}

// Reports API
export const reportsAPI = {
  income: (params) => api.get(`/reports/income?${buildQuery(params)}`),
  students: (params) => api.get(`/reports/students?${buildQuery(params)}`),
  studentsByClass: (params) => api.get(`/reports/students-by-class?${buildQuery(params)}`),
  certificates: (params) => api.get(`/reports/certificates?${buildQuery(params)}`)
}

// Public API (no auth)
export const publicAPI = {
  getClass: (id) => api.get(`/public/classes/${id}`),
  enrollStudent: (id, data) => api.post(`/public/classes/${id}/students`, data)
}

// Helper to download CSV
export const downloadCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

