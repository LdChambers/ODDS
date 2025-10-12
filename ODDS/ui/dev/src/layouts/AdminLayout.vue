<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-red-8 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>
          Master Admin
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn flat label="Back to Main" icon="arrow_back" @click="$router.push('/dashboard')" />
          <q-btn flat round dense icon="account_circle">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ authStore.fullName }}</q-item-label>
                    <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-red-1">
      <q-list>
        <q-item-label header>Admin Navigation</q-item-label>

        <q-item clickable :to="{ name: 'admin-dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Admin Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'admin-schools' }">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Manage Schools</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'admin-users' }">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Manage Users</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'AdminLayout',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const leftDrawerOpen = ref(false)

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      leftDrawerOpen,
      authStore,
      logout
    }
  }
}
</script>

