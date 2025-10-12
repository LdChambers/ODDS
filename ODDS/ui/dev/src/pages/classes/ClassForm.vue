<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Class' : 'Create Class' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/classes')" />
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.fk_courseID"
                outlined
                type="number"
                label="Course ID *"
                :rules="[val => !!val || 'Required']"
                hint="Select the course for this class"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.fk_InstructorID"
                outlined
                type="number"
                label="Instructor ID *"
                :rules="[val => !!val || 'Required']"
                hint="Select the instructor"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.fk_locationID"
                outlined
                type="number"
                label="Location ID *"
                :rules="[val => !!val || 'Required']"
                hint="Select the class location"
              />
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

          <q-input
            v-model="form.notes"
            outlined
            type="textarea"
            label="Notes"
            rows="3"
            hint="Additional class information"
          />

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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { classesAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'ClassForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const isEdit = computed(() => !!route.params.id)

    const form = ref({
      fk_courseID: null,
      fk_InstructorID: null,
      fk_locationID: null,
      fk_schoolID: authStore.userSchoolId,
      completionDate: '',
      amountPaid: 0,
      notes: ''
    })

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
      loadClass()
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

