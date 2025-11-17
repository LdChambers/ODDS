<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Instructor' : 'Add Instructor' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/instructors')" />
    </div>

    <q-card>
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
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                outlined
                type="email"
                label="Email"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.phone"
                outlined
                label="Phone"
                mask="(###) ###-####"
              />
            </div>
          </div>

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
              <q-input
                v-model.number="form.fk_stateID"
                outlined
                type="number"
                label="State ID"
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
import { instructorsAPI } from 'src/services/api'

export default {
  name: 'InstructorForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()

    const loading = ref(false)
    const isEdit = computed(() => !!route.params.id)

    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      fk_stateID: 1,
      zipCode: '',
      notes: ''
    })

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
      loadInstructor()
    })

    return {
      form,
      loading,
      isEdit,
      onSubmit
    }
  }
}
</script>

