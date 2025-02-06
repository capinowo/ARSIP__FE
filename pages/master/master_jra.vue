<!-- eslint-disable camelcase -->
<script setup>
import Snackbar from '@/components/Snackbar.vue'
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import AddNewMasterJra from '@/views/apps/master-jra/AddNewMasterJra.vue'
import DeleteMasterJra from '@/views/apps/master-jra/DeleteMasterJra.vue'
import EditMasterJra from '@/views/apps/master-jra/EditMasterJra.vue'


import { onMounted, ref } from 'vue'

const isAddClassificationDrawerOpen = ref(false)
const isEditClassificationDrawerOpen = ref(false)
const isDeleteDialogOpen = ref(false) // Track delete confirmation dialog
const classificationToDelete = ref(null) // Store classification ID to delete
const searchQuery = ref('')
const classifications = ref([])
const isLoading = ref(false)
const totalClassifications = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedClassification = ref({})
const snackbarRef = ref(null)


// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Kode', key: 'classification_code' },
  { title: 'Deskripsi', key: 'description' },
  { title: 'Aktif', key: 'retention_active' },
  { title: 'Inaktif', key: 'retention_inactive' },
  { title: 'Disposisi', key: 'retention_disposition_id' },
  { title: 'Keamanan', key: 'security_classification_id' },
  { title: 'Aksi', key: 'actions', sortable: false },
]

// Fetch classifications
const fetchClassifications = async () => {
  const query = `
    query {
      getClassifications {
        data {
          id
          classification_code
          description
          retention_active
          retention_inactive
          retention_disposition_id
          security_classification_id
          created_at
          updated_at
        }
      }
    }
  `

  isLoading.value = true
  try {
    const token = getSelectedRoleToken()

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    classifications.value = result.data.getClassifications.data
    totalClassifications.value = classifications.value.length
  } catch (error) {
    console.error('Error fetching classifications:', error)
  } finally {
    isLoading.value = false
  }
}

// Create classification
const createClassification = async newClassificationData => {
  const mutation = `
    mutation CreateClassification($data: ClassificationCreateInput!) {
      createClassification(data: $data) {
        classification_code
        created_at
        description
        id
        retention_active
        retention_disposition_id
        retention_inactive
        security_classification_id
      }
    }
  `

  // Convert `retention_active` and `retention_inactive` to integers
  const variables = {
    data: {
      ...newClassificationData,
      retention_active: parseInt(newClassificationData.retention_active, 10),
      retention_inactive: parseInt(newClassificationData.retention_inactive, 10),
    },
  }

  try {
    const token = getSelectedRoleToken()

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    const result = await response.json()
    if (result.data.createClassification) {
      classifications.value.push(result.data.createClassification)
      totalClassifications.value += 1
    }
  } catch (error) {
    console.error('Error creating classification:', error)
    snackbarRef.value.showSnackbar('This is an error message', 'error')
  } finally {
    isAddClassificationDrawerOpen.value = false
  }
}

// Open edit drawer with selected classification
const openEditClassification = classification => {
  selectedClassification.value = { ...classification } // Clone to avoid direct mutations
  isEditClassificationDrawerOpen.value = true
}

// Update classification
const updateClassification = async updatedClassificationData => {
  const mutation = `
    mutation UpdateClassification($updateClassificationId: Int!, $data: ClassificationUpdateInput!) {
      updateClassification(id: $updateClassificationId, data: $data) {
        classification_code
        description
        retention_active
        retention_disposition_id
        retention_inactive
        security_classification_id
      }
    }
  `

  // Convert `retention_active` and `retention_inactive` to integers
  const variables = {
    updateClassificationId: updatedClassificationData.id,
    data: {
      classification_code: updatedClassificationData.classification_code,
      description: updatedClassificationData.description,
      retention_active: parseInt(updatedClassificationData.retention_active, 10),
      retention_inactive: parseInt(updatedClassificationData.retention_inactive, 10),
      security_classification_id: updatedClassificationData.security_classification_id,
    },
  }

  try {
    const token = getSelectedRoleToken()

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors)
      snackbarRef.value.showSnackbar('This is an error message', 'error')
      
      return
    }

    if (result.data && result.data.updateClassification) {
      const index = classifications.value.findIndex(
        cls => cls.id === updatedClassificationData.id,
      )

      if (index !== -1) {
        classifications.value[index] = {
          ...classifications.value[index],
          ...result.data.updateClassification,
        }
      }
    } else {
      console.error('Unexpected response structure:', result)
    }
  } catch (error) {
    console.error('Error updating classification:', error)
    snackbarRef.value.showSnackbar('This is an error message', 'error')
  } finally {
    isEditClassificationDrawerOpen.value = false // Close the drawer after updating
  }
}

// Open delete confirmation dialog
const openDeleteDialog = classificationId => {
  classificationToDelete.value = classificationId
  isDeleteDialogOpen.value = true
}

// Handle confirmed delete action
const handleDeleteClassification = async classificationId => {
  const mutation = `
    mutation DeleteClassification($deleteClassificationId: Int!) {
      deleteClassification(id: $deleteClassificationId) {
        id
      }
    }
  `

  const variables = { deleteClassificationId: classificationId }

  try {
    const token = getSelectedRoleToken()

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    const result = await response.json()
    if (result.data.deleteClassification) {
      classifications.value = classifications.value.filter(
        cls => cls.id !== classificationId,
      )
      totalClassifications.value -= 1
    }
  } catch (error) {
    console.error('Error deleting classification:', error)
    snackbarRef.value.showSnackbar('This is an error message', 'error')
  } finally {
    isDeleteDialogOpen.value = false
    classificationToDelete.value = null
  }
}

onMounted(() => {
  fetchClassifications()
})
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-classification-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Classification"
            density="compact"
            class="me-4"
          />
          <VBtn @click="isAddClassificationDrawerOpen = true">
            Add New JRA
          </VBtn>
        </div>
      </VCard>
    </div>

    <!-- Table to display classifications -->
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="classifications"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalClassifications"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-key="id"
          @update:page="currentPage = $event"
          @update:items-per-page="itemsPerPage = $event"
        >
          <!-- Displaying row numbers -->
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Custom rendering for Retention Active column -->
          <template #item.retention_active="{ item }">
            {{ item.retention_active }} Tahun
          </template>
          
          <!-- Custom rendering for Retention Inactive column -->
          <template #item.retention_inactive="{ item }">
            {{ item.retention_inactive }} Tahun
          </template>
          
          <!-- Custom rendering for Retention Disposition ID column -->
          <template #item.retention_disposition_id="{ item }">
            {{ item.retention_disposition_id === 1 ? 'Musnah' : item.retention_disposition_id === 2 ? 'Permanen' : '' }}
          </template>

          <template #item.security_classification_id="{ item }">
            {{ item.security_classification_id === 1 ? 'Biasa/Terbuka' : item.security_classification_id === 2 ? 'Terbatas' : '' }}
          </template>

          <!-- Actions column with edit and delete buttons -->
          <template #item.actions="{ item }">
            <div class="d-flex">
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="openEditClassification(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="openDeleteDialog(item.id)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>
    <Snackbar ref="snackbarRef" />

    <!-- AddNewMasterJra Drawer Component -->
    <AddNewMasterJra
      :is-drawer-open="isAddClassificationDrawerOpen"
      @update:is-drawer-open="isAddClassificationDrawerOpen = $event"
      @create-classification="createClassification"
    />

    <!-- EditMasterJra Drawer Component -->
    <EditMasterJra
      :is-drawer-open="isEditClassificationDrawerOpen"
      :classification="selectedClassification"
      @update:is-drawer-open="isEditClassificationDrawerOpen = $event"
      @update-classification="updateClassification"
    />

    <!-- Delete Confirmation Dialog Component -->
    <DeleteMasterJra
      :is-open="isDeleteDialogOpen"
      :classification-id="classificationToDelete"
      @confirm="handleDeleteClassification"
      @close="isDeleteDialogOpen = false"
    />
  </section>
</template>
