<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Classes</div>
      <q-btn color="primary" icon="add" label="Create Class" @click="$router.push('/classes/add')" />
    </div>

    <q-table
      :rows="classes"
      :columns="columns"
      row-key="classID"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      @row-click="(evt, row) => manageClass(row)"
      class="cursor-pointer"
    >
      <template v-slot:body-cell-completionDate="props">
        <q-td :props="props">
          {{ formatDate(props.row.completionDate) }}
        </q-td>
      </template>

      <template v-slot:body-cell-students="props">
        <q-td :props="props">
          <q-badge color="blue">
            {{ props.row.studentCount || 0 }} students
          </q-badge>
          <q-badge color="green" class="q-ml-sm">
            {{ props.row.processedCount || 0 }} processed
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-amountPaid="props">
        <q-td :props="props">
          ${{ props.row.amountPaid.toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" color="primary" @click="editClass(props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="qr_code" color="purple" @click="showQR(props.row)">
            <q-tooltip>QR Code</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { classesAPI } from 'src/services/api'

export default {
  name: 'ClassList',

  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const classes = ref([])
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'completionDate',
      descending: true,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0
    })

    const columns = [
      { name: 'name', label: 'Class Name', align: 'left', field: row => row.name || row.course?.name || 'Unnamed Class' },
      { name: 'school', label: 'School', align: 'left', field: row => row.school?.name },
      { name: 'location', label: 'Location', align: 'left', field: row => row.location?.name },
      { name: 'instructor', label: 'Instructor', align: 'left', field: row => row.instructor ? `${row.instructor.firstName} ${row.instructor.lastName}` : 'N/A' },
      { name: 'completionDate', label: 'Date', align: 'left', field: 'completionDate', sortable: true },
      { name: 'students', label: 'Students', align: 'center' },
      { name: 'amountPaid', label: 'Paid', align: 'right', field: 'amountPaid', sortable: true },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const loadClasses = async (props) => {
      loading.value = true

      const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value

      try {
        const params = {
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder: descending ? 'desc' : 'asc'
        }

        const response = await classesAPI.list(params)
        classes.value = response.data.classes
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
          message: 'Failed to load classes',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadClasses(props)
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return date.formatDate(dateStr, 'MMM DD, YYYY')
    }

    const editClass = (classData) => {
      router.push(`/classes/${classData.classID}/edit`)
    }

    const manageClass = (classData) => {
      router.push(`/classes/${classData.classID}/manage`)
    }

    const showQR = (classData) => {
      router.push(`/classes/${classData.classID}/qr`)
    }

    onMounted(() => {
      loadClasses()
    })

    return {
      classes,
      loading,
      pagination,
      columns,
      loadClasses,
      onRequest,
      formatDate,
      editClass,
      manageClass,
      showQR
    }
  }
}
</script>

