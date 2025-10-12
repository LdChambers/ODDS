<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 600px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h5">Class Enrollment QR Code</div>
        <div class="text-subtitle2" v-if="classData">
          {{ classData.course?.name }}
        </div>
      </q-card-section>

      <q-card-section class="text-center" v-if="qrCode">
        <div class="q-mb-md">
          <img :src="qrCode" alt="QR Code" style="max-width: 400px; width: 100%;" />
        </div>

        <div class="text-body1 q-mb-sm">
          Students can scan this QR code to enroll in the class
        </div>

        <q-input
          :model-value="enrollmentUrl"
          outlined
          readonly
          label="Enrollment URL"
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-btn
              flat
              dense
              icon="content_copy"
              @click="copyUrl"
            >
              <q-tooltip>Copy URL</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div class="q-gutter-md">
          <q-btn
            color="primary"
            label="Download QR Code"
            icon="download"
            @click="downloadQR"
          />
          <q-btn
            color="green"
            label="Print QR Code"
            icon="print"
            @click="printQR"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Back to Class"
          @click="$router.push(`/classes/${$route.params.id}/manage`)"
        />
        <q-btn
          flat
          label="Back to Classes"
          @click="$router.push('/classes')"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, copyToClipboard } from 'quasar'
import { classesAPI } from 'src/services/api'

export default {
  name: 'ClassQR',

  setup() {
    const $q = useQuasar()
    const route = useRoute()

    const classData = ref(null)
    const qrCode = ref(null)
    const enrollmentUrl = ref('')

    const loadQRCode = async () => {
      try {
        const [classResponse, qrResponse] = await Promise.all([
          classesAPI.get(route.params.id),
          classesAPI.getQRCode(route.params.id)
        ])

        classData.value = classResponse.data
        qrCode.value = qrResponse.data.qrCode
        enrollmentUrl.value = qrResponse.data.enrollmentUrl
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load QR code',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const copyUrl = () => {
      copyToClipboard(enrollmentUrl.value)
        .then(() => {
          $q.notify({
            type: 'positive',
            message: 'URL copied to clipboard!'
          })
        })
        .catch(() => {
          $q.notify({
            type: 'negative',
            message: 'Failed to copy URL'
          })
        })
    }

    const downloadQR = () => {
      const link = document.createElement('a')
      link.href = qrCode.value
      link.download = `class-${route.params.id}-qr.png`
      link.click()
    }

    const printQR = () => {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Class Enrollment QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 400px;
                margin: 20px 0;
              }
              .info {
                text-align: center;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="info">
              <h2>${classData.value?.course?.name || 'Class Enrollment'}</h2>
              <p>Scan this QR code to enroll in the class</p>
            </div>
            <img src="${qrCode.value}" alt="QR Code" />
            <div class="info">
              <p>${enrollmentUrl.value}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }

    onMounted(() => {
      loadQRCode()
    })

    return {
      classData,
      qrCode,
      enrollmentUrl,
      copyUrl,
      downloadQR,
      printQR
    }
  }
}
</script>

