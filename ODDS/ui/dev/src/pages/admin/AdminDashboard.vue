<template>
  <q-page padding>
    <div class="text-h4 q-mb-lg">Master Admin Dashboard</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/admin/schools')">
          <q-card-section class="bg-red-5 text-white">
            <q-icon name="business" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Manage Schools</div>
            <div class="text-caption text-grey-7">View and configure all schools</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="cursor-pointer hover-lift" @click="$router.push('/admin/users')">
          <q-card-section class="bg-red-7 text-white">
            <q-icon name="people" size="48px" />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Manage Users</div>
            <div class="text-caption text-grey-7">Manage user accounts and permissions</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>

