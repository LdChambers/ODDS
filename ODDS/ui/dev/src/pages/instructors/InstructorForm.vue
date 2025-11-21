<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Instructor' : 'Add Instructor' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/instructors')" />
    </div>

    <q-card class="q-px-md">
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.firstName"
                outlined
                label="First Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.lastName"
                outlined
                label="Last Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.fk_schoolID"
                outlined
                label="School *"
                :options="schools"
                option-label="name"
                option-value="schoolID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingSchools"
                :disable="!authStore.hasGlobalPermissions"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.city }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                outlined
                type="email"
                label="Email"
                bottom-slots
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.phone"
                outlined
                label="Phone"
                mask="(###) ###-####"
                bottom-slots
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.addressLine1"
                outlined
                label="Address Line 1"
                bottom-slots
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.addressLine2"
                outlined
                label="Address Line 2"
                bottom-slots
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.city"
                outlined
                label="City"
                bottom-slots
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
                bottom-slots
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.zipCode"
                outlined
                label="ZIP Code"
                bottom-slots
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.notes"
                outlined
                type="textarea"
                label="Notes"
                rows="3"
                bottom-slots
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <q-btn
              type="submit"
              color="primary"
              :label="isEdit ? 'Update Instructor' : 'Create Instructor'"
              :loading="loading"
            />
            <q-btn flat label="Cancel" @click="$router.push('/instructors')" />
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
import { instructorsAPI, publicAPI, schoolsAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'InstructorForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const loadingStates = ref(false)
    const loadingSchools = ref(false)
    const isEdit = computed(() => !!route.params.id)
    const states = ref([])
    const schools = ref([])

    const form = ref({
      fk_schoolID: authStore.userSchoolId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      fk_stateID: null,
      zipCode: '',
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

    const loadSchools = async () => {
      loadingSchools.value = true
      try {
        const response = await schoolsAPI.list({ limit: 1000 })
        schools.value = response.data.schools
        
        // Set default school if not set
        if (!form.value.fk_schoolID && schools.value.length > 0 && !authStore.hasGlobalPermissions) {
          form.value.fk_schoolID = authStore.userSchoolId
        }
      } catch (error) {
        console.error('Failed to load schools:', error)
      } finally {
        loadingSchools.value = false
      }
    }

    const loadInstructor = async () => {
      if (!isEdit.value) return

      loading.value = true
      try {
        const response = await instructorsAPI.get(route.params.id)
        form.value = response.data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load instructor',
          caption: error.response?.data?.error || error.message
        })
        router.push('/instructors')
      } finally {
        loading.value = false
      }
    }

    const onSubmit = async () => {
      loading.value = true

      try {
        if (isEdit.value) {
          await instructorsAPI.update(route.params.id, form.value)
          $q.notify({
            type: 'positive',
            message: 'Instructor updated successfully!'
          })
        } else {
          await instructorsAPI.create(form.value)
          $q.notify({
            type: 'positive',
            message: 'Instructor created successfully!'
          })
        }

        router.push('/instructors')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: isEdit.value ? 'Failed to update instructor' : 'Failed to create instructor',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadStates()
      loadSchools()
      loadInstructor()
    })

    return {
      form,
      loading,
      loadingStates,
      loadingSchools,
      isEdit,
      states,
      schools,
      authStore,
      onSubmit
    }
  }
}
</script>

