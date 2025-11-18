<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>
          Class Manager
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
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
                <q-item v-if="authStore.hasGlobalPermissions" clickable v-close-popup @click="$router.push('/admin')">
                  <q-item-section avatar>
                    <q-icon name="admin_panel_settings" />
                  </q-item-section>
                  <q-item-section>Admin Area</q-item-section>
                </q-item>
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header>Navigation</q-item-label>

        <q-item clickable :to="{ name: 'dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'students' }">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Students</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'classes' }">
          <q-item-section avatar>
            <q-icon name="class" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Classes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'instructors' }">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Instructors</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'locations' }">
          <q-item-section avatar>
            <q-icon name="place" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Locations</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'schools' }">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Schools</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'reports' }">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Reports</q-item-label>
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
  name: 'MainLayout',

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

