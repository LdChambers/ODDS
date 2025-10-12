<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">{{ isEdit ? 'Edit Location' : 'Add Location' }}</div>
      <q-btn flat label="Back to List" icon="arrow_back" @click="$router.push('/locations')" />
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-9">
              <q-input
                v-model="form.name"
                outlined
                label="Location Name *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.number"
                outlined
                label="Number"
                hint="Location code"
              />
            </div>
          </div>

          <q-input
            v-model="form.addressLine1"
            outlined
            label="Address Line 1 *"
            :rules="[val => !!val || 'Required']"
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
                label="City *"
                :rules="[val => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.fk_stateID"
                outlined
                type="number"
                label="State ID *"
                :rules="[val => !!val || 'Required']"
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

          <div class="row q-gutter-md">
            <q-btn
              type="submit"
              color="primary"
              :label="isEdit ? 'Update Location' : 'Create Location'"
              :loading="loading"
            />
            <q-btn flat label="Cancel" @click="$router.push('/locations')" />
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
import { locationsAPI } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'LocationForm',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const loading = ref(false)
    const isEdit = computed(() => !!route.params.id)

    const form = ref({
      name: '',
      number: '000',
      addressLine1: '',
      addressLine2: '',
      city: '',
      fk_stateID: 1,
      zipCode: '',
      fk_schoolID: authStore.userSchoolId
    })

    const loadLocation = async () => {
      if (!isEdit.value) return

      loading.value = true
      try {
        const response = await locationsAPI.get(route.params.id)
        form.value = response.data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load location',
          caption: error.response?.data?.error || error.message
        })
        router.push('/locations')
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
          await locationsAPI.update(route.params.id, data)
          $q.notify({
            type: 'positive',
            message: 'Location updated successfully!'
          })
        } else {
          await locationsAPI.create(data)
          $q.notify({
            type: 'positive',
            message: 'Location created successfully!'
          })
        }

        router.push('/locations')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: isEdit.value ? 'Failed to update location' : 'Failed to create location',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadLocation()
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

