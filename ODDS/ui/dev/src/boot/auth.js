import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(({ router }) => {
  // Initialize auth state from localStorage
  const authStore = useAuthStore()
  authStore.initializeAuth()

  console.log('Auth boot loaded, isAuthenticated:', authStore.isAuthenticated)

  // Router guard
  router.beforeEach((to, from, next) => {
    console.log('Router guard:', { to: to.path, from: from.path, requiresAuth: to.meta.requiresAuth })
    
    // Allow access to public routes without auth check
    if (to.meta.requiresAuth === false) {
      console.log('Public route, allowing access')
      next()
      return
    }

    const isAuthenticated = authStore.isAuthenticated
    console.log('isAuthenticated:', isAuthenticated)

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && to.path !== '/login') {
      console.log('Not authenticated, redirecting to login')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated && to.path === '/login') {
      console.log('Already authenticated, redirecting to dashboard')
      next('/dashboard')
      return
    }

    // Check for global permissions requirement
    if (to.meta.requiresGlobalPermissions && !authStore.hasGlobalPermissions) {
      console.log('Global permissions required but not granted, redirecting to dashboard')
      next('/dashboard')
      return
    }

    // All good, proceed
    console.log('All checks passed, proceeding')
    next()
  })
})

