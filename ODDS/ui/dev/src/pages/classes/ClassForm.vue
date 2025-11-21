<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Class' : 'Create Class' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/classes')" />
    </div>

    <q-card class="q-px-md">
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.name"
                outlined
                label="Class Name"
                hint="Optional descriptive name for this class"
                bottom-slots
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
                :loading="loadingOptions"
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
              <q-select
                v-model="form.fk_InstructorID"
                outlined
                label="Instructor *"
                :options="filteredInstructors"
                :option-label="opt => `${opt.firstName} ${opt.lastName}`"
                option-value="instructorID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingOptions"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.firstName }} {{ scope.opt.lastName }}</q-item-label>
                      <q-item-label caption v-if="scope.opt.email">{{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.fk_locationID"
                outlined
                label="Location *"
                :options="locations"
                :option-label="opt => `${opt.number} - ${opt.name}`"
                option-value="locationID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingOptions"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.number }} - {{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.city }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.completionDate"
                outlined
                type="date"
                label="Completion Date *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.amountPaid"
                outlined
                type="number"
                step="0.01"
                label="Amount Paid"
                prefix="$"
                hint="Payment received from instructor"
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
                hint="Additional class information"
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <q-btn
              type="submit"
              color="primary"
              :label="isEdit ? 'Update Class' : 'Create Class'"
              :loading="loading"
            />
            <q-btn flat label="Cancel" @click="$router.push('/classes')" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { classesAPI, instructorsAPI, locationsAPI, schoolsAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'ClassForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const loadingOptions = ref(false)
    const isEdit = computed(() => !!route.params.id)

    const schools = ref([])
    const instructors = ref([])
    const locations = ref([])

    const form = ref({
      name: '',
      fk_InstructorID: null,
      fk_locationID: null,
      fk_schoolID: authStore.userSchoolId,
      completionDate: '',
      amountPaid: 0,
      notes: ''
    })

    // Filter instructors based on selected school
    const filteredInstructors = computed(() => {
      if (!form.value.fk_schoolID) return []
      return instructors.value.filter(instructor => instructor.fk_schoolID === form.value.fk_schoolID)
    })

    // Reset instructor when school changes
    watch(() => form.value.fk_schoolID, (newSchoolId, oldSchoolId) => {
      if (newSchoolId !== oldSchoolId && !isEdit.value) {
        form.value.fk_InstructorID = null
      }
    })

    const loadOptions = async () => {
      loadingOptions.value = true
      try {
        const [schoolsRes, instructorsRes, locationsRes] = await Promise.all([
          schoolsAPI.list({ limit: 1000 }),
          instructorsAPI.list({ limit: 1000 }),
          locationsAPI.list({ limit: 1000 })
        ])
        
        schools.value = schoolsRes.data.schools || []
        instructors.value = instructorsRes.data.instructors || []
        locations.value = locationsRes.data.locations || []
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load form options',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loadingOptions.value = false
      }
    }

    const loadClass = async () => {
      if (!isEdit.value) return

      loading.value = true
      try {
        const response = await classesAPI.get(route.params.id)
        const classData = response.data
        
        form.value = {
          ...classData,
          completionDate: classData.completionDate ? classData.completionDate.split('T')[0] : ''
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load class',
          caption: error.response?.data?.error || error.message
        })
        router.push('/classes')
      } finally {
        loading.value = false
      }
    }

    const onSubmit = async () => {
      loading.value = true

      try {
        const data = {
          ...form.value,
          fk_schoolID: authStore.hasGlobalPermissions ? form.value.fk_schoolID : authStore.userSchoolId
        }

        if (isEdit.value) {
          await classesAPI.update(route.params.id, data)
          $q.notify({
            type: 'positive',
            message: 'Class updated successfully!'
          })
        } else {
          await classesAPI.create(data)
          $q.notify({
            type: 'positive',
            message: 'Class created successfully!'
          })
        }

        router.push('/classes')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: isEdit.value ? 'Failed to update class' : 'Failed to create class',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadOptions()
      loadClass()
    })

    return {
      form,
      loading,
      loadingOptions,
      isEdit,
      schools,
      instructors,
      filteredInstructors,
      locations,
      authStore,
      onSubmit
    }
  }
}
</script>

