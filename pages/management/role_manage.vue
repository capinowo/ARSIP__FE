<script setup>
import { getSelectedRoleToken } from '@/middleware/auth' // Import token retrieval function
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Middleware untuk auth pada halaman
definePageMeta({
  middleware: 'auth-middleware',
})

const router = useRouter()
const searchQuery = ref('')
const roles = ref([])
const isLoading = ref(false)
const totalRoles = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Konfigurasi headers tabel
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Role Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Updated At', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Query GraphQL untuk mendapatkan data roles
const fetchRoles = async () => {
  const query = `
    query GetRoles {
      getRoles {
        data {
          id
          name
          description
          created_at
          updated_at
        }
        total
      }
    }
  `

  isLoading.value = true
  try {
    const token = getSelectedRoleToken() // Get the selected role token

    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    roles.value = result.data.getRoles.data
    totalRoles.value = result.data.getRoles.total
  } catch (error) {
    console.error('Error fetching roles:', error)
  } finally {
    isLoading.value = false
  }
}

// Fungsi placeholder untuk tombol edit dan delete
const editRole = item => {
  console.log('Edit role:', item)
}

const deleteRole = item => {
  console.log('Delete role:', item)
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <section>
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-role-search-filter d-flex align-center">
          <!-- Search Field -->
          <VTextField
            v-model="searchQuery"
            placeholder="Search Role"
            density="compact"
            class="me-4"
          />
          <!-- Add Role Button -->
          <VBtn @click="isAddNewRoleDrawerVisible = true">
            Add New Role
          </VBtn>
        </div>
      </VCard>
    </div>
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="roles"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalRoles"
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

          <!-- Template slot for Actions column -->
          <template #item.actions="{ item }">
            <div class="d-flex">
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="editRole(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="deleteRole(item)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>
  </section>
</template>
