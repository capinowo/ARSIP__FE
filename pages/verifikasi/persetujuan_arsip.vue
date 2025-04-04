<!-- eslint-disable camelcase -->
<script setup>
import useArsipStatus from '@/composables/useArsipStatus'
import useClassification from '@/composables/useClassification'
import { getSelectedRoleToken } from '@/middleware/auth'
import { useTokenStore } from '@/stores/tokenStores'
import { BASE_URL } from "@/utils/api"
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Middleware for auth on the page
definePageMeta({
  middleware: 'auth-middleware',
})

const router = useRouter()
const searchQuery = ref('')
const archives = ref([])
const isLoading = ref(false)
const totalArchives = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const { fetchClassification } = useClassification()
const { fetchArsipStatus } = useArsipStatus()
const snackbarRef = ref(null)
const isDialogOpen = ref(false)  // Track dialog visibility
const archiveToDelete = ref(null)  // Store the archive item to be deleted
const selectedArchives = ref([])
const selectAll = ref(false)


const openDeleteDialog = item => {
  archiveToDelete.value = item  // Set the archive item to be deleted
  isDialogOpen.value = true     // Open the dialog
}

const closeDialog = () => {
  isDialogOpen.value = false   // Close the dialog
}

const tokenStore = useTokenStore()

// onMounted(() => {
//   console.log('Token Store Data on mount:', tokenStore.tokenData)
//   console.log('Selected Unit:', tokenStore.tokenData.selectedUnit)
//   console.log('Selected Unit ID:', tokenStore.tokenData.selectedUnit?.id)
// })


// Confirm deletion and send mutation to delete the archive
const confirmDeletion = async () => {
  if (archiveToDelete.value && archiveToDelete.value.id) {
    await deleteArchive(archiveToDelete.value.id)
    closeDialog()
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedArchives.value = archives.value.map(archive => archive.id)
  } else {
    selectedArchives.value = []
  }
}


const buttons = [
  { label: 'Semua', status: 'all' },
  { label: 'Usul Unggahan Arsip', status: 'active' & 'inactive' & 'static' },
  { label: 'Usul Pemberkasan Arsip', status: 'active' & 'inactive' & 'static' },
]

const filterArchives = async status => {
  let query = `
    query {
      getArchives (where: { approval_status_id: 2 }) {
        total
        data {
          id
          title
          description
          classification_id
          document_path
          archive_status_id
          archive_type_id
          unit_id
          location_id
          user_id
          approval_status_id
          created_at
          updated_at
          jumlah_arsip
          media_arsip
          tingkat_perkembangan
          jumlah_lampiran
          media_lampiran
          final_retensi_aktif
          final_retensi_inaktif
        }
      }
    }
  `

  if (status !== 'all') {
    const statusId = {
      active: 1,
      inactive: 2,
      static: 3,
      destroyed: 4,
    }[status]

    query = `
      query {
        getArchives(where: { archive_status_id: ${statusId}, approval_status_id: 2 }) {
          total
          data {
            id
            title
            description
            classification_id
            document_path
            archive_status_id
            archive_type_id
            unit_id
            location_id
            user_id
            approval_status_id
            created_at
            updated_at
            jumlah_arsip
            media_arsip
            tingkat_perkembangan
            jumlah_lampiran
            media_lampiran
            final_retensi_aktif
            final_retensi_inaktif
          }
        }
      }
    `
  }

  isLoading.value = true
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
    } else if (result.data && result.data.getArchives) {
      archives.value = await Promise.all(
        result.data.getArchives.data.map(async archive => {
          const classification = await fetchClassification(archive.classification_id)
          const status = await fetchArsipStatus(archive.archive_status_id)

          return {
            ...archive,
            classification_description: classification?.description || 'N/A',
            archive_status_name: status?.name || 'N/A',
          }
        }),
      )
      totalArchives.value = result.data.getArchives.total || 0
    } else {
      console.warn('No data returned from getArchives query:', result)
    }
  } catch (error) {
    console.error('Error fetching archives:', error)
    snackbarRef.value.showSnackbar('This is an error message', 'error fetch archives')
  } finally {
    isLoading.value = false
  }
}

// Configure table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Judul', key: 'title' },
  { title: 'Deskripsi', key: 'description' },
  { title: 'Klasifikasi', key: 'classification_description' },
  { title: 'Status', key: 'archive_status_name' },
  { title: 'Actions', key: 'actions', sortable: false },
  { title: '', key: 'select', sortable: false }, // Checkbox kolom
]


// GraphQL query to fetch archives data
//sebelum ke filter unit
// const fetchArchives = async () => {
//   const query = `
//     query {
//       getArchives {
//         total
//         data {
//           id
//           title
//           description
//           classification_id
//           document_path
//           archive_status_id
//           archive_type_id
//           unit_id
//           location_id
//           user_id
//           created_at
//           updated_at
//         }
//       }
//     }
//   `

//   isLoading.value = true
//   try {
//     const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${getSelectedRoleToken()}`,
//       },
//       body: JSON.stringify({ query }),
//     })

//     const result = await response.json()

//     if (result.errors) {
//       console.error('GraphQL errors:', result.errors)
//     } else if (result.data && result.data.getArchives) {
//       // Map archives and fetch classification description
//       archives.value = await Promise.all(
//         result.data.getArchives.data.map(async archive => {
//           const classification = await fetchClassification(archive.classification_id)
//           const status = await fetchArsipStatus(archive.archive_status_id)

//           return {
//             ...archive,
//             classification_description: classification?.description || 'N/A',
//             archive_status_name: status?.name || 'N/A',  // Set status name here
//           }
//         }),
//       )
//       totalArchives.value = result.data.getArchives.total || 0
//     } else {
//       console.warn('No data returned from getArchives query:', result)
//     }
//   } catch (error) {
//     console.error('Error fetching archives:', error)
//     snackbarRef.value.showSnackbar('This is an error message', 'error fetch archives')
//   } finally {
//     isLoading.value = false
//   }
// }

const fetchArchives = async () => {
  const unitId = tokenStore.tokenData.selectedUnit?.id || null // Ambil unit_id dari tokenStore

  // console.log("Fetching archives with unit_id:", unitId) // Debugging unit_id

  const query = `
    query {
      getArchives (where: { approval_status_id: 2 }) {
        total
        data {
          id
          title
          description
          classification_id
          document_path
          archive_status_id
          archive_type_id
          unit_id
          location_id
          user_id
          approval_status_id
          created_at
          updated_at
          jumlah_arsip
          media_arsip
          tingkat_perkembangan
          jumlah_lampiran
          media_lampiran
          final_retensi_aktif
          final_retensi_inaktif
        }
      }
    }
  `

  const variables = {
    where: {
      unit_id: unitId, // Menambahkan unit_id ke dalam filter
    },
  }

  isLoading.value = true
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query, variables }), // Mengirim query beserta variables
    })

    const result = await response.json()

    if (result.errors) {
      console.error("GraphQL errors:", result.errors)
    } else if (result.data && result.data.getArchives) {
      // Map archives dan fetch classification description
      archives.value = await Promise.all(
        result.data.getArchives.data.map(async archive => {
          const classification = await fetchClassification(archive.classification_id)
          const status = await fetchArsipStatus(archive.archive_status_id)

          return {
            ...archive,
            classification_description: classification?.description || "N/A",
            archive_status_name: status?.name || "N/A", // Set status name here
          }
        }),
      )
      totalArchives.value = result.data.getArchives.total || 0
    } else {
      console.warn("No data returned from getArchives query:", result)
    }
  } catch (error) {
    console.error("Error fetching archives:", error)
    snackbarRef.value.showSnackbar("This is an error message", "error fetch archives")
  } finally {
    isLoading.value = false
  }
}


// Function to delete the archive
const deleteArchive = async id => {
  const mutation = `
    mutation DeleteArchive($id: Int!) {
      deleteArchive(id: $id) {
        id
      }
    }
  `

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { id },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)

      return
    }

    if (result.data && result.data.deleteArchive) {
      // Remove the deleted archive from the list
      archives.value = archives.value.filter(archive => archive.id !== id)
      totalArchives.value -= 1 // Update total count
      console.log(`Archive with ID ${id} deleted successfully.`)
    } else {
      console.error('Error: Archive not deleted')
    }
  } catch (error) {
    console.error('Error deleting archive:', error)
    snackbarRef.value.showSnackbar('This is an error message', 'error delete archive')
  } finally {
    isDialogOpen.value = false // Close dialog after deletion
  }
}

const detailArchive = item => {
  router.push({
    path: "/arsip/verifikasi/detail_acc",
    query: { ids: selectedArchives.value.join(",") }
  }); // Mengarahkan ke halaman detail dengan ID dinamis
}


onMounted(() => {
  fetchArchives()
})
</script>

<template>
  <section>
    <Snackbar ref="snackbarRef" />
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-user-search-filter d-flex align-center">
          <!-- Search Field -->
          <VTextField v-model="searchQuery" placeholder="Search Archive" density="compact" class="me-4" />
          <!-- Add New Archive Button -->
          <VBtn @click="router.push('/arsip/add')">
            Add New Arsip
          </VBtn>
        </div>
      </VCard>
    </div>
    <div>
      <VCard style="padding: 24px;">

        <div class="d-flex justify-content-between mb-4">
          <VBtnToggle v-model="activeTab" class="d-flex w-100">
            <VBtn v-for="button in buttons" :key="button.status" @click="filterArchives(button.status)"
              class="flex-grow-1 text-center">
              {{ button.label }}
            </VBtn>
          </VBtnToggle>
        </div>

        <VDataTable :headers="headers" :items="archives" :search="searchQuery" :loading="isLoading"
          :total-items="totalArchives" :items-per-page="itemsPerPage" :page="currentPage" item-key="id"
          @update:page="currentPage = $event" @update:items-per-page="itemsPerPage = $event">
          <!-- Checkbox Header untuk Pilih Semua -->
          <template #column.select>
            <VCheckbox v-model="selectAll" @click="toggleSelectAll" />
          </template>

          <!-- Checkbox di Setiap Baris -->
          <template #item.select="{ item }">
            <VCheckbox v-model="selectedArchives" :value="item.id" />
          </template>

          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <template #item.classification_description="{ item }">
            {{ item.classification_description }}
          </template>

          <template #item.archive_status_name="{ item }">
            {{ item.archive_status_name }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex">
              <VBtn icon style="margin-inline-end: 6px;" @click="detailArchive(item)">
                <VIcon>ri-todo-line</VIcon>
                Detail
              </VBtn>
            </div>
          </template>
        </VDataTable>
        <VBtn v-if="selectedArchives.length > 0" color="primary" @click="processSelectedArchives">
          Proses Arsip Terpilih ({{ selectedArchives.length }})
        </VBtn>

      </VCard>
    </div>
    <!-- Confirmation Dialog for Deletion -->
    <VDialog v-model="isDialogOpen" max-width="400">
      <VCard>
        <VCardTitle>Confirm Deletion</VCardTitle>
        <VCardText>
          Are you sure you want to delete this archive?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" @click="confirmDeletion">
            Yes
          </VBtn>
          <VBtn @click="closeDialog">
            No
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>
