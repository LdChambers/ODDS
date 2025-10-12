<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Students</div>
      <q-btn color="primary" icon="add" label="Add Student" @click="$router.push('/students/add')" />
    </div>

    <!-- Search Filters (UC-2) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Search & Filter</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input v-model="filters.firstName" outlined dense label="First Name" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.lastName" outlined dense label="Last Name" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.email" outlined dense label="Email" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.phone" outlined dense label="Phone" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.licenseNumber" outlined dense label="License Number" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.certificateNumber" outlined dense label="Certificate Number" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filters.ssnLastFour" outlined dense label="SSN Last 4" maxlength="4" />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.isPaid"
              outlined
              dense
              label="Payment Status"
              :options="[
                { label: 'All', value: null },
                { label: 'Paid', value: 'true' },
                { label: 'Unpaid', value: 'false' }
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <q-space />
          <q-btn flat label="Clear" @click="clearFilters" class="q-mr-sm" />
          <q-btn color="primary" label="Search" @click="loadStudents" />
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
import { useQuasar } from 'quasar'
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
      email: '',
      phone: '',
      licenseNumber: '',
      certificateNumber: '',
      ssnLastFour: '',
      isPaid: null
    })

    const columns = [
      { name: 'name', label: 'Name', align: 'left', field: 'lastName', sortable: true },
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

    const clearFilters = () => {
      filters.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        certificateNumber: '',
        ssnLastFour: '',
        isPaid: null
      }
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

    onMounted(() => {
      // Check for search query from dashboard
      if (route.query.search) {
        const search = route.query.search
        // Try to determine what field to search
        if (search.match(/^\d+$/)) {
          filters.value.certificateNumber = search
        } else if (search.includes('@')) {
          filters.value.email = search
        } else {
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
      clearFilters,
      editStudent,
      processCertificate,
      emailCertificate
    }
  }
}
</script>

