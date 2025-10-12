<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Locations</div>
      <q-btn color="primary" icon="add" label="Add Location" @click="$router.push('/locations/add')" />
    </div>

    <q-table
      :rows="locations"
      :columns="columns"
      row-key="locationID"
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-address="props">
        <q-td :props="props">
          {{ props.row.addressLine1 }}, {{ props.row.city }}, {{ props.row.zipCode }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="edit" color="primary" @click="editLocation(props.row)">
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
import { locationsAPI } from 'src/services/api'

export default {
  name: 'LocationList',

  setup() {
    const $q = useQuasar()
    const router = useRouter()

    const locations = ref([])
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0
    })

    const columns = [
      { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
      { name: 'address', label: 'Address', align: 'left' },
      { name: 'number', label: 'Number', align: 'left', field: 'number' },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const loadLocations = async (props) => {
      loading.value = true

      const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value

      try {
        const params = {
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder: descending ? 'desc' : 'asc'
        }

        const response = await locationsAPI.list(params)
        locations.value = response.data.locations
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
          message: 'Failed to load locations',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadLocations(props)
    }

    const editLocation = (location) => {
      router.push(`/locations/${location.locationID}/edit`)
    }

    onMounted(() => {
      loadLocations()
    })

    return {
      locations,
      loading,
      pagination,
      columns,
      loadLocations,
      onRequest,
      editLocation
    }
  }
}
</script>

