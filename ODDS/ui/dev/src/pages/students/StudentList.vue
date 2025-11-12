<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Students</div>
      <q-btn color="primary" icon="add" label="Add Student" @click="$router.push('/students/add')" />
    </div>

    <!-- Search Filters (UC-2) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Search Students</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input 
              v-model="filters.firstName" 
              outlined 
              dense 
              label="First Name"
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input 
              v-model="filters.lastName" 
              outlined 
              dense 
              label="Last Name"
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input 
              v-model="filters.phone" 
              outlined 
              dense 
              label="Phone Number"
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <q-space />
          <q-btn flat label="Clear All" @click="clearFilters" icon="clear" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Students Table -->
    <q-table
      :rows="students"
      :columns="columns"
      row-key="studentID"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          {{ props.row.firstName }} {{ props.row.lastName }}
        </q-td>
      </template>

      <template v-slot:body-cell-class="props">
        <q-td :props="props">
          <div v-if="props.row.class">
            <div class="text-weight-medium">{{ props.row.class.course?.name }}</div>
            <div class="text-caption text-grey-7">
              {{ formatDate(props.row.class.completionDate) }}
              <span v-if="props.row.class.location"> - {{ props.row.class.location.name }}</span>
            </div>
          </div>
          <span v-else class="text-grey-6">No class assigned</span>
        </q-td>
      </template>

      <template v-slot:body-cell-isPaid="props">
        <q-td :props="props">
          <q-badge :color="props.row.isPaid ? 'green' : 'red'">
            {{ props.row.isPaid ? 'Paid' : 'Unpaid' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-certificateNumber="props">
        <q-td :props="props">
          <q-badge v-if="props.row.certificateNumber" color="primary">
            {{ props.row.certificateNumber }}
          </q-badge>
          <span v-else class="text-grey-6">Not issued</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" color="primary" @click="editStudent(props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="card_membership"
            color="green"
            @click="processCertificate(props.row)"
            :disable="!!props.row.certificateNumber"
          >
            <q-tooltip>Issue Certificate</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="email"
            color="blue"
            @click="emailCertificate(props.row)"
            :disable="!props.row.certificateNumber"
          >
            <q-tooltip>Email Certificate</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { studentsAPI } from 'src/services/api'

export default {
  name: 'StudentList',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()

    const students = ref([])
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'lastName',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0
    })

    const filters = ref({
      firstName: '',
      lastName: '',
      phone: ''
    })

    let searchTimeout = null

    const columns = [
      { name: 'name', label: 'Name', align: 'left', field: 'lastName', sortable: true },
      { name: 'class', label: 'Class', align: 'left', field: 'class' },
      { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
      { name: 'phoneNumber', label: 'Phone', align: 'left', field: 'phoneNumber' },
      { name: 'licenseNumber', label: 'License #', align: 'left', field: 'licenseNumber' },
      { name: 'certificateNumber', label: 'Certificate', align: 'center', field: 'certificateNumber' },
      { name: 'isPaid', label: 'Paid', align: 'center', field: 'isPaid', sortable: true },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const loadStudents = async (props) => {
      loading.value = true

      const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value

      try {
        const params = {
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder: descending ? 'desc' : 'asc',
          ...Object.fromEntries(
            Object.entries(filters.value).filter(([_, v]) => v !== null && v !== '')
          )
        }

        const response = await studentsAPI.list(params)
        students.value = response.data.students
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
          message: 'Failed to load students',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadStudents(props)
    }

    const onFilterChange = () => {
      // Debounce search - wait 500ms after user stops typing
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      searchTimeout = setTimeout(() => {
        // Reset to page 1 when filters change
        pagination.value.page = 1
        loadStudents()
      }, 500)
    }

    const clearFilters = () => {
      filters.value = {
        firstName: '',
        lastName: '',
        phone: ''
      }
      pagination.value.page = 1
      loadStudents()
    }

    const editStudent = (student) => {
      router.push(`/students/${student.studentID}/edit`)
    }

    const processCertificate = async (student) => {
      $q.loading.show({ message: 'Processing certificate...' })

      try {
        await studentsAPI.processCertificate(student.studentID)
        $q.notify({
          type: 'positive',
          message: 'Certificate processed successfully!'
        })
        loadStudents()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to process certificate',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        $q.loading.hide()
      }
    }

    const emailCertificate = async (student) => {
      try {
        await studentsAPI.emailCertificate(student.studentID)
        $q.notify({
          type: 'positive',
          message: `Certificate emailed to ${student.email}`
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to email certificate',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return date.formatDate(dateStr, 'MMM DD, YYYY')
    }

    onMounted(() => {
      // Check for search query from dashboard
      if (route.query.search) {
        const search = route.query.search
        // Try to determine what field to search
        if (search.match(/^\d+$/)) {
          // If it's digits, search by phone
          filters.value.phone = search
        } else {
          // Otherwise search by last name
          filters.value.lastName = search
        }
      }
      loadStudents()
    })

    return {
      students,
      loading,
      pagination,
      filters,
      columns,
      loadStudents,
      onRequest,
      onFilterChange,
      clearFilters,
      editStudent,
      processCertificate,
      emailCertificate,
      formatDate
    }
  }
}
</script>

