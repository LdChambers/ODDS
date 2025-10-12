<template>
  <q-page padding>
    <div class="text-h4 q-mb-lg">Reports</div>

    <div class="row q-col-gutter-md">
      <!-- Income Report -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-green-5 text-white">
            <div class="text-h6">Income Report</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="generateIncomeReport" class="q-gutter-md">
              <q-input
                v-model="incomeFilters.startDate"
                outlined
                type="date"
                label="Start Date"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="incomeFilters.endDate"
                outlined
                type="date"
                label="End Date"
                :rules="[val => !!val || 'Required']"
              />
              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="View Report"
                  icon="visibility"
                />
                <q-btn
                  color="green"
                  label="Download CSV"
                  icon="download"
                  @click="downloadIncomeCSV"
                  :disable="!incomeFilters.startDate || !incomeFilters.endDate"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Students Report -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-blue-5 text-white">
            <div class="text-h6">Students Report</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="generateStudentsReport" class="q-gutter-md">
              <q-input
                v-model="studentsFilters.startDate"
                outlined
                type="date"
                label="Start Date"
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                v-model="studentsFilters.endDate"
                outlined
                type="date"
                label="End Date"
                :rules="[val => !!val || 'Required']"
              />
              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="View Report"
                  icon="visibility"
                />
                <q-btn
                  color="green"
                  label="Download CSV"
                  icon="download"
                  @click="downloadStudentsCSV"
                  :disable="!studentsFilters.startDate || !studentsFilters.endDate"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Students by Class Report -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-purple-5 text-white">
            <div class="text-h6">Students by Class</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="generateClassReport" class="q-gutter-md">
              <q-input
                v-model.number="classFilters.classID"
                outlined
                type="number"
                label="Class ID (optional)"
                hint="Leave empty for all classes"
              />
              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="View Report"
                  icon="visibility"
                />
                <q-btn
                  color="green"
                  label="Download CSV"
                  icon="download"
                  @click="downloadClassCSV"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Certificate Export -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-orange-5 text-white">
            <div class="text-h6">Certificate Export (State)</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="downloadCertificatesCSV" class="q-gutter-md">
              <q-input
                v-model="certificateFilters.startDate"
                outlined
                type="date"
                label="Start Date (optional)"
              />
              <q-input
                v-model="certificateFilters.endDate"
                outlined
                type="date"
                label="End Date (optional)"
              />
              <q-btn
                type="submit"
                color="green"
                label="Export CSV for State"
                icon="download"
                class="full-width"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Report Results Dialog -->
    <q-dialog v-model="showResults" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ currentReportTitle }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="reportData">
          <div class="q-mb-md" v-if="reportData.summary">
            <strong>Summary:</strong>
            <pre>{{ JSON.stringify(reportData.summary, null, 2) }}</pre>
          </div>

          <q-table
            v-if="reportData.report"
            :rows="reportData.report"
            :columns="reportColumns"
            :pagination="{ rowsPerPage: 25 }"
            row-key="id"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { reportsAPI, downloadCSV } from 'src/services/api'

export default {
  name: 'Reports',

  setup() {
    const $q = useQuasar()

    const showResults = ref(false)
    const currentReportTitle = ref('')
    const reportData = ref(null)
    const reportColumns = ref([])

    const incomeFilters = ref({
      startDate: '',
      endDate: ''
    })

    const studentsFilters = ref({
      startDate: '',
      endDate: ''
    })

    const classFilters = ref({
      classID: null
    })

    const certificateFilters = ref({
      startDate: '',
      endDate: ''
    })

    const generateIncomeReport = async () => {
      try {
        const response = await reportsAPI.income({
          startDate: incomeFilters.value.startDate,
          endDate: incomeFilters.value.endDate
        })

        reportData.value = response.data
        currentReportTitle.value = 'Income Report'
        reportColumns.value = [
          { name: 'classID', label: 'Class ID', field: 'classID', align: 'left' },
          { name: 'schoolName', label: 'School', field: 'schoolName', align: 'left' },
          { name: 'courseName', label: 'Course', field: 'courseName', align: 'left' },
          { name: 'completionDate', label: 'Date', field: 'completionDate', align: 'left' },
          { name: 'studentCount', label: 'Students', field: 'studentCount', align: 'center' },
          { name: 'expectedRevenue', label: 'Expected', field: row => `$${row.expectedRevenue.toFixed(2)}`, align: 'right' },
          { name: 'amountPaid', label: 'Paid', field: row => `$${row.amountPaid.toFixed(2)}`, align: 'right' }
        ]
        showResults.value = true
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to generate report',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const downloadIncomeCSV = async () => {
      $q.loading.show({ message: 'Generating CSV...' })
      try {
        const response = await reportsAPI.income({
          startDate: incomeFilters.value.startDate,
          endDate: incomeFilters.value.endDate,
          format: 'csv'
        })
        downloadCSV(response.data, `income-report-${incomeFilters.value.startDate}-to-${incomeFilters.value.endDate}.csv`)
        $q.notify({ type: 'positive', message: 'Report downloaded!' })
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to download report' })
      } finally {
        $q.loading.hide()
      }
    }

    const generateStudentsReport = async () => {
      try {
        const response = await reportsAPI.students({
          startDate: studentsFilters.value.startDate,
          endDate: studentsFilters.value.endDate
        })

        reportData.value = response.data
        currentReportTitle.value = 'Students Report'
        reportColumns.value = [
          { name: 'studentID', label: 'ID', field: 'studentID', align: 'left' },
          { name: 'firstName', label: 'First Name', field: 'firstName', align: 'left' },
          { name: 'lastName', label: 'Last Name', field: 'lastName', align: 'left' },
          { name: 'email', label: 'Email', field: 'email', align: 'left' },
          { name: 'licenseNumber', label: 'License', field: 'licenseNumber', align: 'left' },
          { name: 'certificateNumber', label: 'Certificate', field: 'certificateNumber', align: 'left' },
          { name: 'isPaid', label: 'Paid', field: 'isPaid', align: 'center' }
        ]
        showResults.value = true
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to generate report',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const downloadStudentsCSV = async () => {
      $q.loading.show({ message: 'Generating CSV...' })
      try {
        const response = await reportsAPI.students({
          startDate: studentsFilters.value.startDate,
          endDate: studentsFilters.value.endDate,
          format: 'csv'
        })
        downloadCSV(response.data, `students-report-${studentsFilters.value.startDate}-to-${studentsFilters.value.endDate}.csv`)
        $q.notify({ type: 'positive', message: 'Report downloaded!' })
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to download report' })
      } finally {
        $q.loading.hide()
      }
    }

    const generateClassReport = async () => {
      try {
        const response = await reportsAPI.studentsByClass({
          classID: classFilters.value.classID
        })

        reportData.value = response.data
        currentReportTitle.value = 'Students by Class Report'
        reportColumns.value = [
          { name: 'classID', label: 'Class', field: 'classID', align: 'left' },
          { name: 'courseName', label: 'Course', field: 'courseName', align: 'left' },
          { name: 'studentID', label: 'Student ID', field: 'studentID', align: 'left' },
          { name: 'firstName', label: 'First Name', field: 'firstName', align: 'left' },
          { name: 'lastName', label: 'Last Name', field: 'lastName', align: 'left' },
          { name: 'certificateNumber', label: 'Certificate', field: 'certificateNumber', align: 'left' },
          { name: 'isPaid', label: 'Paid', field: 'isPaid', align: 'center' }
        ]
        showResults.value = true
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to generate report',
          caption: error.response?.data?.error || error.message
        })
      }
    }

    const downloadClassCSV = async () => {
      $q.loading.show({ message: 'Generating CSV...' })
      try {
        const response = await reportsAPI.studentsByClass({
          classID: classFilters.value.classID,
          format: 'csv'
        })
        downloadCSV(response.data, `students-by-class-report.csv`)
        $q.notify({ type: 'positive', message: 'Report downloaded!' })
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to download report' })
      } finally {
        $q.loading.hide()
      }
    }

    const downloadCertificatesCSV = async () => {
      $q.loading.show({ message: 'Generating CSV...' })
      try {
        const response = await reportsAPI.certificates(certificateFilters.value)
        downloadCSV(response.data, `state-certificate-export-${new Date().toISOString().split('T')[0]}.csv`)
        $q.notify({ type: 'positive', message: 'Certificate export downloaded!' })
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to download certificate export' })
      } finally {
        $q.loading.hide()
      }
    }

    return {
      incomeFilters,
      studentsFilters,
      classFilters,
      certificateFilters,
      showResults,
      currentReportTitle,
      reportData,
      reportColumns,
      generateIncomeReport,
      downloadIncomeCSV,
      generateStudentsReport,
      downloadStudentsCSV,
      generateClassReport,
      downloadClassCSV,
      downloadCertificatesCSV
    }
  }
}
</script>

