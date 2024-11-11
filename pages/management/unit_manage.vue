<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import { onMounted, ref } from 'vue';

// const isAddUnitDrawerOpen = ref(false)
const searchQuery = ref('')
const units = ref([])
const isLoading = ref(false)
const totalUnits = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Code Name', key: 'codename' },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  // { title: 'Updated At', key: 'updated_at' },
  // { title: 'Actions', key: 'actions', sortable: false },
]

// Fetch units
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
    const token = getSelectedRoleToken()

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
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

// Function to create a new unit
const createUnit = async newUnitData => {
  const mutation = `
    mutation Mutation($data: UnitCreateInput!) {
      createUnit(data: $data) {
        id
        codename
        name
        description
        created_at
        updated_at
      }
    }
  `

  const variables = {
    data: {
      codename: newUnitData.codename,
      name: newUnitData.name,
      description: newUnitData.description,
    },
  }

  try {
    const token = getSelectedRoleToken()

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    const result = await response.json()
    const createdUnit = result.data.createUnit

    // Add the new unit to the list
    units.value.push(createdUnit)
    totalUnits.value = units.value.length
  } catch (error) {
    console.error('Error creating unit:', error)
  }
}

onMounted(() => {
  fetchUnits()
})
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-unit-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Unit"
            density="compact"
            class="me-4"
          />
          <!-- <VBtn @click="isAddUnitDrawerOpen = true">
            Add New Unit
          </VBtn> -->
        </div>
      </VCard>
    </div>

    <!-- Table to display units -->
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
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex">
              <!-- <VBtn
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
              </VBtn> -->
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>

    <!-- AddUnit Drawer Component -->
    <!-- <AddUnit
      :is-drawer-open="isAddUnitDrawerOpen"
      @update:is-drawer-open="isAddUnitDrawerOpen = $event"
      @create-unit="createUnit"
    /> -->
  </section>
</template>

