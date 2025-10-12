<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 600px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5">Enroll in Class</div>
        <div class="text-subtitle2" v-if="classInfo">
          {{ classInfo.courseName }} - {{ formatDate(classInfo.completionDate) }}
        </div>
      </q-card-section>

      <q-card-section v-if="classInfo && !submitted">
        <div class="q-mb-md">
          <div class="text-subtitle1">Class Information</div>
          <div><strong>Location:</strong> {{ classInfo.locationName }}</div>
          <div v-if="classInfo.locationAddress">
            {{ classInfo.locationAddress.addressLine1 }}<br>
            {{ classInfo.locationAddress.city }}, {{ classInfo.locationAddress.zipCode }}
          </div>
        </div>

        <q-separator class="q-my-md" />

        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="text-h6">Student Information</div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.firstName"
                outlined
                label="First Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.lastName"
                outlined
                label="Last Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <q-input
            v-model="form.email"
            outlined
            type="email"
            label="Email *"
            :rules="[val => !!val || 'Required']"
          />

          <q-input
            v-model="form.phoneNumber"
            outlined
            label="Phone Number *"
            mask="(###) ###-####"
            :rules="[val => !!val || 'Required']"
          />

          <q-input
            v-model="form.addressLine1"
            outlined
            label="Address *"
            :rules="[val => !!val || 'Required']"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.city"
                outlined
                label="City *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.zipCode"
                outlined
                label="ZIP Code *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
          </div>

          <q-input
            v-model="form.licenseNumber"
            outlined
            label="License Number *"
            :rules="[val => !!val || 'Required']"
          />

          <q-input
            v-model="form.birthDate"
            outlined
            type="date"
            label="Birth Date *"
            :rules="[val => !!val || 'Required']"
          />

          <q-btn
            type="submit"
            color="primary"
            label="Enroll"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="submitted" class="text-center">
        <q-icon name="check_circle" color="green" size="64px" />
        <div class="text-h6 q-mt-md">Enrollment Successful!</div>
        <div class="text-body2 q-mt-sm">
          Thank you for enrolling. You will receive a confirmation email shortly.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { publicAPI } from 'src/services/api'

export default {
  name: 'PublicEnroll',

  setup() {
    const $q = useQuasar()
    const route = useRoute()

    const classInfo = ref(null)
    const loading = ref(false)
    const submitted = ref(false)

    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      zipCode: '',
      licenseNumber: '',
      birthDate: '',
      fk_stateID: 1,
      fk_licenseStateID: 1
    })

    const loadClassInfo = async () => {
      try {
        const response = await publicAPI.getClass(route.params.classId)
        classInfo.value = response.data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load class information'
        })
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return date.formatDate(dateStr, 'MMM DD, YYYY')
    }

    const onSubmit = async () => {
      loading.value = true

      try {
        await publicAPI.enrollStudent(route.params.classId, form.value)
        submitted.value = true
        $q.notify({
          type: 'positive',
          message: 'Enrollment successful!',
          caption: 'You will receive a confirmation email shortly.'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Enrollment failed',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadClassInfo()
    })

    return {
      classInfo,
      form,
      loading,
      submitted,
      formatDate,
      onSubmit
    }
  }
}
</script>

