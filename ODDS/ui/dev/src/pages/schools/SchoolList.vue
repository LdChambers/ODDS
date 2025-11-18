<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Schools</div>
      <q-btn 
        v-if="authStore.hasGlobalPermissions"
        color="primary" 
        icon="add" 
        label="Add School" 
        @click="$router.push('/schools/add')" 
      />
    </div>

    <!-- Schools Table -->
    <q-table
      :rows="schools"
      :columns="columns"
      row-key="schoolID"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div class="text-caption text-grey-7">{{ props.row.shortName }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-contact="props">
        <q-td :props="props">
          <div v-if="props.row.contactName">{{ props.row.contactName }}</div>
          <div class="text-caption">{{ props.row.email }}</div>
          <div class="text-caption">{{ props.row.phoneNumber }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-location="props">
        <q-td :props="props">
          <div v-if="props.row.city">{{ props.row.city }}</div>
          <div class="text-caption" v-if="props.row.addressLine1">{{ props.row.addressLine1 }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-stats="props">
        <q-td :props="props">
          <div class="text-caption">
            <div>Instructors: {{ props.row._count?.instructors || 0 }}</div>
            <div>Locations: {{ props.row._count?.locations || 0 }}</div>
            <div>Classes: {{ props.row._count?.classes || 0 }}</div>
            <div>Students: {{ props.row._count?.students || 0 }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="visibility" color="primary" @click="viewSchool(props.row)">
            <q-tooltip>View Details</q-tooltip>
          </q-btn>
          <q-btn 
            v-if="authStore.hasGlobalPermissions"
            flat 
            dense 
            round 
            icon="edit" 
            color="primary" 
            @click="editSchool(props.row)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn 
            v-if="authStore.hasGlobalPermissions"
            flat 
            dense 
            round 
            icon="delete" 
            color="negative" 
            @click="deleteSchool(props.row)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { schoolsAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'SchoolList',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const authStore = useAuthStore()

    const schools = ref([])
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0
    })

    const columns = [
      { name: 'name', label: 'School Name', align: 'left', field: 'name', sortable: true },
      { name: 'contact', label: 'Contact', align: 'left' },
      { name: 'location', label: 'Location', align: 'left', field: 'city', sortable: true },
      { name: 'stats', label: 'Statistics', align: 'left' },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const loadSchools = async (props) => {
      loading.value = true

      const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value

      try {
        const params = {
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder: descending ? 'desc' : 'asc'
        }

        const response = await schoolsAPI.list(params)
        schools.value = response.data.schools
        pagination.value = {
          ...pagination.value,
          page,
          rowsPerPage,
          sortBy,
          descending,
          rowsNumber: response.data.pagination.total
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load schools',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadSchools(props)
    }

    const viewSchool = (school) => {
      $q.dialog({
        title: school.name,
        message: `
          <div style="line-height: 1.8;">
            <strong>Short Name:</strong> ${school.shortName || 'N/A'}<br>
            <strong>Contact:</strong> ${school.contactName || 'N/A'}<br>
            <strong>Email:</strong> ${school.email || 'N/A'}<br>
            <strong>Phone:</strong> ${school.phoneNumber || 'N/A'}<br>
            <strong>Address:</strong> ${school.addressLine1 || 'N/A'}<br>
            ${school.city}, ${school.zipCode}<br>
            <strong>URL:</strong> ${school.url || 'N/A'}<br>
            <hr style="margin: 10px 0;">
            <strong>Statistics:</strong><br>
            - Instructors: ${school._count?.instructors || 0}<br>
            - Locations: ${school._count?.locations || 0}<br>
            - Classes: ${school._count?.classes || 0}<br>
            - Students: ${school._count?.students || 0}
          </div>
        `,
        html: true
      })
    }

    const editSchool = (school) => {
      router.push(`/schools/${school.schoolID}/edit`)
    }

    const deleteSchool = (school) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${school.name}"? This action cannot be undone.`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await schoolsAPI.delete(school.schoolID)
          $q.notify({
            type: 'positive',
            message: 'School deleted successfully!'
          })
          loadSchools()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Failed to delete school',
            caption: error.response?.data?.error || error.message
          })
        }
      })
    }

    onMounted(() => {
      loadSchools()
    })

    return {
      schools,
      loading,
      pagination,
      columns,
      authStore,
      loadSchools,
      onRequest,
      viewSchool,
      editSchool,
      deleteSchool
    }
  }
}
</script>

