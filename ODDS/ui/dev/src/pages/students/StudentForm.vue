<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Student' : 'Add Student' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/students')" />
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.firstName"
                outlined
                label="First Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.middleInitial"
                outlined
                label="Middle Initial"
                maxlength="1"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.lastName"
                outlined
                label="Last Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                outlined
                type="email"
                label="Email *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.phoneNumber"
                outlined
                label="Phone Number *"
                mask="(###) ###-####"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.addressLine1"
                outlined
                label="Address Line 1 *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.addressLine2"
                outlined
                label="Address Line 2"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.city"
                outlined
                label="City *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.fk_stateID"
                outlined
                label="State *"
                :options="states"
                option-label="name"
                option-value="stateID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingStates"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.zipCode"
                outlined
                label="ZIP Code *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.licenseNumber"
                outlined
                label="License Number *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.fk_licenseStateID"
                outlined
                label="License State *"
                :options="states"
                option-label="name"
                option-value="stateID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingStates"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.ssnLastFour"
                outlined
                label="SSN Last 4"
                maxlength="4"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.birthDate"
                outlined
                type="date"
                label="Birth Date *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.fk_classID"
                outlined
                label="Class *"
                :options="classes"
                :option-label="opt => `${opt.course?.name || 'Class'} - ${formatDate(opt.completionDate)}`"
                option-value="classID"
                emit-value
                map-options
                :rules="[val => !!val || 'Required']"
                :loading="loadingClasses"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.course?.name || 'Class' }}</q-item-label>
                      <q-item-label caption>{{ formatDate(scope.opt.completionDate) }} - {{ scope.opt.location?.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-checkbox v-model="isPaid" label="Payment Received" />
            </div>
          </div>

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
              :label="isEdit ? 'Update Student' : 'Create Student'"
              :loading="loading"
            />
            <q-btn
              flat
              label="Cancel"
              @click="$router.push('/students')"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { studentsAPI, publicAPI, classesAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'StudentForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const loadingStates = ref(false)
    const loadingClasses = ref(false)
    const isEdit = computed(() => !!route.params.id)
    const isPaid = ref(false)
    const states = ref([])
    const classes = ref([])

    const form = ref({
      firstName: '',
      middleInitial: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      fk_stateID: 1,
      zipCode: '',
      licenseNumber: '',
      fk_licenseStateID: 1,
      ssnLastFour: '',
      birthDate: '',
      fk_classID: null,
      fk_schoolID: authStore.userSchoolId,
      isPaid: 0,
      notes: ''
    })

    const loadStudent = async () => {
      if (!isEdit.value) return

      loading.value = true
      try {
        const response = await studentsAPI.get(route.params.id)
        const student = response.data
        
        form.value = {
          ...student,
          birthDate: student.birthDate ? student.birthDate.split('T')[0] : ''
        }
        isPaid.value = student.isPaid === 1
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load student',
          caption: error.response?.data?.error || error.message
        })
        router.push('/students')
      } finally {
        loading.value = false
      }
    }

    const onSubmit = async () => {
      loading.value = true

      try {
        const data = {
          ...form.value,
          isPaid: isPaid.value ? 1 : 0,
          fk_schoolID: authStore.hasGlobalPermissions ? form.value.fk_schoolID : authStore.userSchoolId
        }

        if (isEdit.value) {
          await studentsAPI.update(route.params.id, data)
          $q.notify({
            type: 'positive',
            message: 'Student updated successfully!'
          })
        } else {
          await studentsAPI.create(data)
          $q.notify({
            type: 'positive',
            message: 'Student created successfully!'
          })
        }

        router.push('/students')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: isEdit.value ? 'Failed to update student' : 'Failed to create student',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const loadStates = async () => {
      loadingStates.value = true
      try {
        const response = await publicAPI.getStates()
        states.value = response.data.states
        if (states.value.length > 0 && !form.value.fk_stateID) {
          form.value.fk_stateID = states.value[0].stateID
          form.value.fk_licenseStateID = states.value[0].stateID
        }
      } catch (error) {
        console.error('Failed to load states:', error)
      } finally {
        loadingStates.value = false
      }
    }

    const loadClasses = async () => {
      loadingClasses.value = true
      try {
        const response = await classesAPI.list({ limit: 1000 })
        classes.value = response.data.classes
      } catch (error) {
        console.error('Failed to load classes:', error)
      } finally {
        loadingClasses.value = false
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return date.formatDate(dateStr, 'MMM DD, YYYY')
    }

    onMounted(() => {
      loadStates()
      loadClasses()
      loadStudent()
    })

    return {
      form,
      isPaid,
      loading,
      loadingStates,
      loadingClasses,
      isEdit,
      states,
      classes,
      formatDate,
      onSubmit
    }
  }
}
</script>

