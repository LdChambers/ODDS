<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h4 q-mb-sm">Dashboard</div>
      <div class="text-subtitle1 text-grey-7">
        Welcome back, {{ authStore.fullName }}!
      </div>
    </div>

    <!-- Global Search -->
    <q-card class="q-mb-lg" v-if="false">
      <q-card-section>
        <div class="text-h6 q-mb-md">Search Students</div>
        <q-input
          v-model="searchQuery"
          outlined
          placeholder="Search by name, license number, or certificate number..."
          @keyup.enter="performSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              round
              dense
              icon="close"
              v-if="searchQuery"
              @click="searchQuery = ''"
            />
            <q-btn
              color="primary"
              label="Search"
              @click="performSearch"
              :disable="!searchQuery"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Quick Access Cards -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/students')">
          <q-card-section class="bg-blue-5 text-white">
            <q-icon name="school" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Students</div>
            <div class="text-caption text-grey-7">Manage student records and certificates</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/classes')">
          <q-card-section class="bg-green-5 text-white">
            <q-icon name="class" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Classes</div>
            <div class="text-caption text-grey-7">Create and manage class sessions</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/instructors')">
          <q-card-section class="bg-orange-5 text-white">
            <q-icon name="person" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Instructors</div>
            <div class="text-caption text-grey-7">Manage instructor profiles</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/locations')">
          <q-card-section class="bg-purple-5 text-white">
            <q-icon name="place" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Locations</div>
            <div class="text-caption text-grey-7">Manage class locations</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/reports')">
          <q-card-section class="bg-teal-5 text-white">
            <q-icon name="assessment" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Reports</div>
            <div class="text-caption text-grey-7">Generate and export reports</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'Dashboard',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const searchQuery = ref('')

    const performSearch = () => {
      if (searchQuery.value) {
        router.push({
          name: 'students',
          query: {
            search: searchQuery.value
          }
        })
      }
    }

    return {
      authStore,
      searchQuery,
      performSearch
    }
  }
}
</script>

<style scoped>
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>

