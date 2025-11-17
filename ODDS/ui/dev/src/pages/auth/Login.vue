<template>
  <q-page class="flex flex-center bg-primary">
    <q-card style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h4 text-weight-bold text-primary q-mb-md">
          Class Manager
        </div>
        <div class="text-subtitle2 text-grey-7">
          For Driving Safety
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email Address"
            outlined
            :rules="[val => !!val || 'Email is required']"
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :rules="[val => !!val || 'Password is required']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row justify-between items-center">
            <q-btn
              flat
              dense
              color="primary"
              label="Forgot Password?"
              @click="showForgotPassword"
              no-caps
            />
          </div>

          <q-btn
            type="submit"
            color="primary"
            label="Login"
            class="full-width"
            size="lg"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center text-caption text-grey-7">
        <div class="q-mb-sm">Test Credentials:</div>
        <div><strong>Admin:</strong> admin@odds.com / password</div>
        <div><strong>Instructor:</strong> instructor@school1.com / password</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'LoginPage',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const loading = ref(false)

    const onSubmit = async () => {
      loading.value = true

      try {
        const result = await authStore.login(email.value, password.value)

        if (result.success) {
          $q.notify({
            type: 'positive',
            message: 'Login successful!',
            caption: `Welcome back, ${result.user.firstName}!`
          })

          // Redirect to intended page or dashboard
          const redirect = route.query.redirect || '/dashboard'
          router.push(redirect)
        } else {
          $q.notify({
            type: 'negative',
            message: 'Login failed',
            caption: result.error
          })
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'An error occurred',
          caption: error.message
        })
      } finally {
        loading.value = false
      }
    }

    const showForgotPassword = () => {
      $q.dialog({
        title: 'Forgot Password',
        message: 'Password reset functionality coming soon. Please contact your administrator for assistance.',
        ok: {
          label: 'OK',
          color: 'primary'
        }
      })
    }

    return {
      email,
      password,
      showPassword,
      loading,
      onSubmit,
      showForgotPassword
    }
  }
}
</script>

