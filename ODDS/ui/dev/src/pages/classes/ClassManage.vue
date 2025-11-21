<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <div class="text-h4">Manage Class</div>
        <div class="text-subtitle1 text-grey-7" v-if="classData">
          {{ classData.name || classData.course?.name || 'Class' }} - {{ formatDate(classData.completionDate) }}
        </div>
      </div>
      <div class="q-gutter-sm">
        <q-btn flat label="Back to Classes" icon="arrow_back" @click="$router.push('/classes')" />
        <q-btn color="primary" label="QR Code" icon="qr_code" @click="$router.push(`/classes/${$route.params.id}/qr`)" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md" v-if="classData">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="bg-blue-5 text-white">
            <div class="text-h6">{{ classData.students?.length || 0 }}</div>
            <div class="text-caption">Total Students</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="bg-green-5 text-white">
            <div class="text-h6">{{ processedCount }}</div>
            <div class="text-caption">Processed</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="bg-orange-5 text-white">
            <div class="text-h6">{{ paidCount }}</div>
            <div class="text-caption">Paid</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section class="bg-purple-5 text-white">
            <div class="text-h6">${{ classData.amountPaid?.toFixed(2) || '0.00' }}</div>
            <div class="text-caption">Payment Received</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Actions -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Class Actions</div>
        <div class="row q-gutter-md">
          <q-btn
            color="primary"
            label="Add Student"
            icon="person_add"
            @click="$router.push(`/students/add?classID=${$route.params.id}`)"
          />
          <q-btn
            color="green"
            label="Process All Certificates"
            icon="card_membership"
            @click="processAllCertificates"
            :disable="!hasUnprocessed"
          />
          <q-btn
            color="blue"
            label="Email All Certificates"
            icon="email"
            @click="emailAllCertificates"
            :disable="processedCount === 0"
          />
          <q-btn
            color="orange"
            label="Record Payment"
            icon="payment"
            @click="showPaymentDialog = true"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Students Table -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Class Roster</div>
        <q-table
          :rows="students"
          :columns="columns"
          row-key="studentID"
          :loading="loading"
          :pagination="{ rowsPerPage: 25 }"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              {{ props.row.firstName }} {{ props.row.lastName }}
            </q-td>
          </template>

          <template v-slot:body-cell-isPaid="props">
            <q-td :props="props">
              <q-badge :color="props.row.isPaid ? 'green' : 'red'">
                {{ props.row.isPaid ? 'Paid' : 'Unpaid' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-certificateNumber="props">
            <q-td :props="props">
              <q-badge v-if="props.row.certificateNumber" color="primary">
                {{ props.row.certificateNumber }}
              </q-badge>
              <span v-else class="text-grey-6">Not issued</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="editStudent(props.row)"
              >
                <q-tooltip>Edit Student</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="card_membership"
                color="green"
                @click="processSingleCertificate(props.row)"
                :disable="!!props.row.certificateNumber"
              >
                <q-tooltip>Issue Certificate</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="email"
                color="blue"
                @click="emailSingleCertificate(props.row)"
                :disable="!props.row.certificateNumber"
              >
                <q-tooltip>Email Certificate</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add Student Dialog -->
    <q-dialog v-model="showAddStudent">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Student to Class</div>
        </q-card-section>
        <q-card-section>
          <p class="text-body2">
            You can add a student by sharing the QR code or enrollment link with them.
          </p>
          <q-btn
            color="primary"
            label="View QR Code"
            icon="qr_code"
            @click="$router.push(`/classes/${$route.params.id}/qr`)"
            class="full-width"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Dialog -->
    <q-dialog v-model="showPaymentDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Record Payment</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="recordPayment" class="q-gutter-md">
            <div class="text-body2">
              Expected: ${{ (paidCount * 10).toFixed(2) }} ({{ paidCount }} paid students × $10)
            </div>
            <q-input
              v-model.number="paymentForm.amount"
              outlined
              type="number"
              step="0.01"
              label="Amount Received"
              prefix="$"
              :rules="[val => val > 0 || 'Amount required']"
            />
            <q-input
              v-model="paymentForm.transactionId"
              outlined
              label="Transaction ID"
            />
            <q-input
              v-model="paymentForm.notes"
              outlined
              type="textarea"
              label="Notes"
              rows="3"
            />
            <div class="row q-gutter-md">
              <q-btn type="submit" color="primary" label="Record Payment" />
              <q-btn flat label="Cancel" v-close-popup />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { classesAPI, studentsAPI } from 'src/services/api'

export default {
  name: 'ClassManage',

  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()

    const classData = ref(null)
    const loading = ref(false)
    const showAddStudent = ref(false)
    const showPaymentDialog = ref(false)

    const paymentForm = ref({
      amount: 0,
      transactionId: '',
      notes: ''
    })

    const columns = [
      { name: 'name', label: 'Name', align: 'left' },
      { name: 'email', label: 'Email', align: 'left', field: 'email' },
      { name: 'phoneNumber', label: 'Phone', align: 'left', field: 'phoneNumber' },
      { name: 'certificateNumber', label: 'Certificate', align: 'center' },
      { name: 'isPaid', label: 'Paid', align: 'center' },
      { name: 'actions', label: 'Actions', align: 'center' }
    ]

    const students = computed(() => classData.value?.students || [])
    const processedCount = computed(() => students.value.filter(s => s.certificateNumber).length)
    const paidCount = computed(() => students.value.filter(s => s.isPaid).length)
    const hasUnprocessed = computed(() => students.value.some(s => !s.certificateNumber))

    const loadClass = async () => {
      loading.value = true
      try {
        const response = await classesAPI.get(route.params.id)
        classData.value = response.data
        paymentForm.value.amount = paidCount.value * 10
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

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return date.formatDate(dateStr, 'MMM DD, YYYY')
    }

    const processAllCertificates = async () => {
      $q.loading.show({ message: 'Processing certificates...' })
      try {
        const response = await classesAPI.processAll(route.params.id)
        $q.notify({
          type: 'positive',
          message: `Processed ${response.data.processed.length} certificates!`
        })
        loadClass()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to process certificates',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        $q.loading.hide()
      }
    }

    const emailAllCertificates = async () => {
      try {
        await classesAPI.emailCertificates(route.params.id)
        $q.notify({
          type: 'positive',
          message: 'Certificates emailed to all students!'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to email certificates',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const processSingleCertificate = async (student) => {
      $q.loading.show()
      try {
        await studentsAPI.processCertificate(student.studentID)
        $q.notify({
          type: 'positive',
          message: 'Certificate processed!'
        })
        loadClass()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to process certificate',
          caption: error.response?.data?.error || error.message
        })
      } finally {
        $q.loading.hide()
      }
    }

    const emailSingleCertificate = async (student) => {
      try {
        await studentsAPI.emailCertificate(student.studentID)
        $q.notify({
          type: 'positive',
          message: `Certificate emailed to ${student.email}`
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to email certificate',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const recordPayment = async () => {
      try {
        await classesAPI.recordPayment(route.params.id, paymentForm.value)
        $q.notify({
          type: 'positive',
          message: 'Payment recorded successfully!'
        })
        showPaymentDialog.value = false
        loadClass()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to record payment',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const editStudent = (student) => {
      router.push(`/students/${student.studentID}/edit`)
    }

    onMounted(() => {
      loadClass()
    })

    return {
      classData,
      loading,
      students,
      columns,
      showAddStudent,
      showPaymentDialog,
      paymentForm,
      processedCount,
      paidCount,
      hasUnprocessed,
      formatDate,
      processAllCertificates,
      emailAllCertificates,
      processSingleCertificate,
      emailSingleCertificate,
      recordPayment,
      editStudent
    }
  }
}
</script>

