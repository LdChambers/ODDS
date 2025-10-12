<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Instructors</div>
      <q-btn color="primary" icon="add" label="Add Instructor" @click="$router.push('/instructors/add')" />
    </div>

    <q-table
      :rows="instructors"
      :columns="columns"
      row-key="instructorID"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          {{ props.row.firstName }} {{ props.row.lastName }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" color="primary" @click="editInstructor(props.row)">
            <q-tooltip>Edit</q-tooltip>
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
import { instructorsAPI } from 'src/services/api'

export default {
  name: 'InstructorList',

  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const instructors = ref([])
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'lastName',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0
    })

    const columns = [
      { name: 'name', label: 'Name', align: 'left', sortable: true },
      { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
      { name: 'phone', label: 'Phone', align: 'left', field: 'phone' },
      { name: 'city', label: 'City', align: 'left', field: 'city' },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const loadInstructors = async (props) => {
      loading.value = true

      const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value

      try {
        const params = {
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder: descending ? 'desc' : 'asc'
        }

        const response = await instructorsAPI.list(params)
        instructors.value = response.data.instructors
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
          message: 'Failed to load instructors',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadInstructors(props)
    }

    const editInstructor = (instructor) => {
      router.push(`/instructors/${instructor.instructorID}/edit`)
    }

    onMounted(() => {
      loadInstructors()
    })

    return {
      instructors,
      loading,
      pagination,
      columns,
      loadInstructors,
      onRequest,
      editInstructor
    }
  }
}
</script>

