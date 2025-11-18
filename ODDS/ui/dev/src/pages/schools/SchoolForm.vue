<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit School' : 'Add School' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/schools')" />
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.name"
                outlined
                label="School Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.shortName"
                outlined
                label="Short Name *"
                :rules="[val => !!val || 'Required']"
                hint="Abbreviation or short code"
              />
            </div>
          </div>

          <div class="text-h6 q-mt-md">Contact Information</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.contactName"
                outlined
                label="Contact Name"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                outlined
                type="email"
                label="Email"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.phoneNumber"
                outlined
                label="Phone Number"
                mask="(###) ###-####"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.url"
                outlined
                type="url"
                label="Website URL"
              />
            </div>
          </div>

          <div class="text-h6 q-mt-md">Address</div>

          <q-input
            v-model="form.addressLine1"
            outlined
            label="Address Line 1"
          />

          <q-input
            v-model="form.addressLine2"
            outlined
            label="Address Line 2"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.city"
                outlined
                label="City"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.fk_stateID"
                outlined
                label="State"
                :options="states"
                option-label="name"
                option-value="stateID"
                emit-value
                map-options
                :loading="loadingStates"
                clearable
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.zipCode"
                outlined
                label="ZIP Code"
              />
            </div>
          </div>

          <div class="text-h6 q-mt-md">Additional Settings</div>

          <q-select
            v-model="form.defaultDayOfWeek"
            outlined
            label="Default Day of Week"
            :options="daysOfWeek"
            emit-value
            map-options
          />

          <q-input
            v-model="form.notes"
            outlined
            type="textarea"
            label="Notes"
            rows="3"
          />

          <div class="row q-gutter-md">
            <q-btn
              type="submit"
              color="primary"
              :label="isEdit ? 'Update School' : 'Create School'"
              :loading="loading"
            />
            <q-btn flat label="Cancel" @click="$router.push('/schools')" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { schoolsAPI, publicAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'SchoolForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const loadingStates = ref(false)
    const isEdit = computed(() => !!route.params.id)
    const states = ref([])

    const daysOfWeek = [
      { label: 'Sunday', value: 0 },
      { label: 'Monday', value: 1 },
      { label: 'Tuesday', value: 2 },
      { label: 'Wednesday', value: 3 },
      { label: 'Thursday', value: 4 },
      { label: 'Friday', value: 5 },
      { label: 'Saturday', value: 6 }
    ]

    const form = ref({
      name: '',
      shortName: '',
      contactName: '',
      email: '',
      phoneNumber: '',
      url: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      fk_stateID: null,
      zipCode: '',
      defaultDayOfWeek: 1,
      notes: ''
    })

    const loadStates = async () => {
      loadingStates.value = true
      try {
        const response = await publicAPI.getStates()
        states.value = response.data.states
      } catch (error) {
        console.error('Failed to load states:', error)
      } finally {
        loadingStates.value = false
      }
    }

    const loadSchool = async () => {
      if (!isEdit.value) return

      loading.value = true
      try {
        const response = await schoolsAPI.get(route.params.id)
        form.value = response.data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load school',
          caption: error.response?.data?.error || error.message
        })
        router.push('/schools')
      } finally {
        loading.value = false
      }
    }

    const onSubmit = async () => {
      // Check if user has permissions
      if (!authStore.hasGlobalPermissions) {
        $q.notify({
          type: 'negative',
          message: 'Insufficient permissions',
          caption: 'Only admins can create/edit schools'
        })
        return
      }

      loading.value = true

      try {
        if (isEdit.value) {
          await schoolsAPI.update(route.params.id, form.value)
          $q.notify({
            type: 'positive',
            message: 'School updated successfully!'
          })
        } else {
          await schoolsAPI.create(form.value)
          $q.notify({
            type: 'positive',
            message: 'School created successfully!'
          })
        }

        router.push('/schools')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: isEdit.value ? 'Failed to update school' : 'Failed to create school',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadStates()
      loadSchool()
    })

    return {
      form,
      loading,
      loadingStates,
      isEdit,
      states,
      daysOfWeek,
      onSubmit
    }
  }
}
</script>

