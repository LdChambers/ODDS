import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasGlobalPermissions: (state) => state.user?.hasGlobalPermissions === 1,
    userSchoolId: (state) => state.user?.fk_schoolID,
    isAdmin: (state) => state.user?.role === 'admin',
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
  },

  actions: {
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    },

    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true, user }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed'
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }
})

