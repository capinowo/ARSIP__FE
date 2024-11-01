<script setup>
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Middleware untuk auth pada halaman
definePageMeta({
  middleware: 'auth-middleware',
})


const router = useRouter()
const isAddNewUserDrawerVisible = ref(false)
const searchQuery = ref('')
const users = ref([])
const isLoading = ref(false)
const totalUsers = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Konfigurasi headers tabel
const headers = [
  { title: 'No', key: 'no', sortable: false },  // Kolom No
  { title: 'Nama', key: 'name' },               // Kolom Nama
  { title: 'Email', key: 'email' },             // Kolom Email
  { title: 'Username', key: 'username' },       // Kolom Username
  { title: 'NIP', key: 'sso_identity' },        // Kolom NIP
  { title: 'Actions', key: 'actions', sortable: false }, // Kolom Actions
]

// Query GraphQL untuk mendapatkan data pengguna
const fetchUsers = async () => {
  const query = `
    query UserGetList {
      userGetList {
        data {
          id
          name
          email
          username
          sso_identity
        }
      }
    }
  `

  isLoading.value = true
  try {
    const response = await fetch('https://x5phivbwydc28xcqc.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    users.value = result.data.userGetList.data
    totalUsers.value = users.value.length
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

// Fungsi placeholder untuk tombol edit dan delete
const editUser = item => {
  console.log('Edit user:', item)
}

const deleteUser = item => {
  console.log('Delete user:', item)
}

// Fungsi untuk menambahkan pengguna baru
const addNewUser = userData => {
  console.log('Data user baru:', userData)
}

onMounted(() => {
  fetchUsers()
})
</script>


<template>
  <section>
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-user-search-filter d-flex align-center">
          <!-- Search Field -->
          <VTextField
            v-model="searchQuery"
            placeholder="Search User"
            density="compact"
            class="me-4"
          />
          <!-- Add User Button -->
          <VBtn @click="isAddNewUserDrawerVisible = true">
            Add New User
          </VBtn>
        </div>
      </VCard>
    </div>
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="users"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalUsers"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-key="id"
          @update:page="currentPage = $event"
          @update:items-per-page="itemsPerPage = $event"
        >
          <!-- Template slot untuk kolom No -->
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Template slot untuk kolom Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex justify-end">
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="editUser(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="deleteUser(item)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>
    <!-- Drawer untuk Tambah User Baru -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>

