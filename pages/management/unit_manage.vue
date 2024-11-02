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
const units = ref([])
const isLoading = ref(false)
const totalUnits = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Konfigurasi headers tabel
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Code Name', key: 'codename' },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Updated At', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Query GraphQL untuk mendapatkan data units
const fetchUnits = async () => {
  const query = `
    query GetUnits {
      getUnits {
        data {
          id
          codename
          name
          description
          created_at
          updated_at
        }
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

    units.value = result.data.getUnits.data
    totalUnits.value = units.value.length
  } catch (error) {
    console.error('Error fetching units:', error)
  } finally {
    isLoading.value = false
  }
}

// Fungsi placeholder untuk tombol edit dan delete
const editUnit = item => {
  console.log('Edit unit:', item)
}

const deleteUnit = item => {
  console.log('Delete unit:', item)
}

onMounted(() => {
  fetchUnits()
})
</script>

<template>
  <section>
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-unit-search-filter d-flex align-center">
          <!-- Search Field -->
          <VTextField
            v-model="searchQuery"
            placeholder="Search Unit"
            density="compact"
            class="me-4"
          />
          <!-- Add Unit Button -->
          <VBtn @click="isAddNewUnitDrawerVisible = true">
            Add New Unit
          </VBtn>
        </div>
      </VCard>
    </div>
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="units"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalUnits"
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
            <div class="d-flex justify-end">
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="editUnit(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="deleteUnit(item)"
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
