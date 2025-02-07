<!-- eslint-disable vue/attribute-hyphenation -->
<script setup>
import useRoleList from '@/composables/useRoleList'
import useUnitList from '@/composables/useUnitList'
import useUserList from '@/composables/useUserList'
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import AddNewUnitRole from '@/views/apps/management/unit-has-roles/AddNewUnitRole.vue'
import { onMounted, ref } from 'vue'

const searchQuery = ref('')
const roleUnits = ref([])
const isLoading = ref(false)
const totalRoleUnits = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const isAddUnitRoleDrawerOpen = ref(false)

const { fetchUnitList, units } = useUnitList()
const { fetchRoleList, roles } = useRoleList()
const { fetchUserList, users } = useUserList()

const formatDate = dateString => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
  const year = date.getFullYear()
  
  return `${day}-${month}-${year}`
}

// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Unit Name', key: 'unit_name' },
  { title: 'Role Name', key: 'role_name' },
  { title: 'User Name', key: 'user_name' },
]

// Fetch role units
const fetchRoleUnits = async () => {
  const query = `
    query GetRoleUnits {
      getRoleUnits {
        data {
          id
          unit {
            name
          }
          role {
            name
          }
          role_id
          unit_id
          user_id
          user {
            name
          }
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

    roleUnits.value = result.data.getRoleUnits.data
    totalRoleUnits.value = roleUnits.value.length
  } catch (error) {
    console.error('Error fetching role units:', error)
  } finally {
    isLoading.value = false
  }
}

// Create role unit
const createRoleUnit = async newRoleUnitData => {
  const mutation = `
    mutation Mutation($data: RoleUnitCreateInput!) {
      createRoleUnit(data: $data) {
        id
        role_id
        unit_id
        user_id
      }
    }
  `

  const variables = {
    data: newRoleUnitData,
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
    const createdRoleUnit = result.data.createRoleUnit

    // Add the new role unit to the list
    roleUnits.value.push(createdRoleUnit)
    totalRoleUnits.value = roleUnits.value.length
    fetchRoleUnits() // Fetch the updated list of role units
  } catch (error) {
    // console.error('Error creating role unit:', error)
  } finally {
    isAddUnitRoleDrawerOpen.value = false
  }
}

onMounted(() => {
  fetchRoleUnits()
  fetchUnitList()
  fetchRoleList()
  fetchUserList()
})
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-role-unit-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Role Unit"
            density="compact"
            class="me-4"
          />
          <VBtn @click="isAddUnitRoleDrawerOpen = true">
            Add New Unit Role
          </VBtn>
        </div>
      </VCard>
    </div>

    <!-- Table to display role units -->
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="roleUnits"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalRoleUnits"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-key="id"
          @update:page="currentPage = $event"
          @update:items-per-page="itemsPerPage = $event"
        >
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <template #item.unit_name="{ item }">
            {{ item.unit.name }}
          </template>

          <template #item.role_name="{ item }">
            {{ item.role.name }}
          </template>

          <template #item.user_name="{ item }">
            {{ item.user.name }}
          </template>
        </VDataTable>
      </VCard>
    </div>

    <AddNewUnitRole
      :is-drawer-open="isAddUnitRoleDrawerOpen"
      :units="units"
      :roles="roles"
      :users="users"
      Listen
      for
      the
      refresh
      event
      @update:is-drawer-open="isAddUnitRoleDrawerOpen = $event"
      @create-unit-role="createRoleUnit"
      @refresh-role-units="fetchRoleUnits"
    />
  </section>
</template>
