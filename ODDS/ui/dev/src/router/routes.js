const routes = [
  // Public routes (no auth)
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/auth/Login.vue'), meta: { requiresAuth: false } }
    ]
  },
  {
    path: '/public/enroll/:classId',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'public-enroll', component: () => import('pages/public/Enroll.vue'), meta: { requiresAuth: false } }
    ]
  },

  // Main application routes (requires auth)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('pages/Dashboard.vue') },
      
      // Students
      { path: 'students', name: 'students', component: () => import('pages/students/StudentList.vue') },
      { path: 'students/add', name: 'student-add', component: () => import('pages/students/StudentForm.vue') },
      { path: 'students/:id/edit', name: 'student-edit', component: () => import('pages/students/StudentForm.vue') },
      
      // Classes
      { path: 'classes', name: 'classes', component: () => import('pages/classes/ClassList.vue') },
      { path: 'classes/add', name: 'class-add', component: () => import('pages/classes/ClassForm.vue') },
      { path: 'classes/:id/edit', name: 'class-edit', component: () => import('pages/classes/ClassForm.vue') },
      { path: 'classes/:id/manage', name: 'class-manage', component: () => import('pages/classes/ClassManage.vue') },
      { path: 'classes/:id/qr', name: 'class-qr', component: () => import('pages/classes/ClassQR.vue') },
      
      // Instructors
      { path: 'instructors', name: 'instructors', component: () => import('pages/instructors/InstructorList.vue') },
      { path: 'instructors/add', name: 'instructor-add', component: () => import('pages/instructors/InstructorForm.vue') },
      { path: 'instructors/:id/edit', name: 'instructor-edit', component: () => import('pages/instructors/InstructorForm.vue') },
      
      // Locations
      { path: 'locations', name: 'locations', component: () => import('pages/locations/LocationList.vue') },
      { path: 'locations/add', name: 'location-add', component: () => import('pages/locations/LocationForm.vue') },
      { path: 'locations/:id/edit', name: 'location-edit', component: () => import('pages/locations/LocationForm.vue') },
      
      // Reports
      { path: 'reports', name: 'reports', component: () => import('pages/reports/Reports.vue') }
    ]
  },

  // Master Admin routes (requires global permissions)
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('pages/admin/AdminDashboard.vue'), meta: { requiresGlobalPermissions: true } },
      { path: 'schools', name: 'admin-schools', component: () => import('pages/admin/Schools.vue'), meta: { requiresGlobalPermissions: true } },
      { path: 'users', name: 'admin-users', component: () => import('pages/admin/Users.vue'), meta: { requiresGlobalPermissions: true } }
    ]
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
    meta: { requiresAuth: false }
  }
]

export default routes
