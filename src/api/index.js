import axios from 'axios'

const BASE_URL = 'http://192.168.30.7:5000'

export const api = {
  measure: () => axios.post(`${BASE_URL}/api/measure`),
  logsToday: () => axios.get(`${BASE_URL}/api/logs/today`),
  saveLog: (data) => axios.post(`${BASE_URL}/api/logs`, data),
  calendarMonth: (year, month, userId) => axios.get(`${BASE_URL}/api/calendar/month`, { params: { year, month, user_id: userId } }),
  week: (userId) => axios.get(`${BASE_URL}/api/logs/week`, { params: { user_id: userId } }),
  status: () => axios.get(`${BASE_URL}/api/status`),
  shorts: () => axios.get(`${BASE_URL}/api/shorts`),
  unlock: () => axios.post(`${BASE_URL}/api/shorts/unlock`),
  register: (data) => axios.post(`${BASE_URL}/api/auth/register`, data),
  login: (data) => axios.post(`${BASE_URL}/api/auth/login`, data),
  deleteAccount: (userId) =>
    axios.delete(`${BASE_URL}/api/auth/delete`, { data: { user_id: userId } }),
}