<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import AddRole from '@/views/apps/management/role/AddRole.vue';
import { onMounted, ref } from 'vue';

const isAddRoleDrawerOpen = ref(false)
const searchQuery = ref('')
const roles = ref([])
const isLoading = ref(false)
const totalRoles = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Updated At', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Fetch roles
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
      }
    }
  `

  isLoading.value = true
  try {
    const token = getSelectedRoleToken()

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
    totalRoles.value = roles.value.length
  } catch (error) {
    console.error('Error fetching roles:', error)
  } finally {
    isLoading.value = false
  }
}

// Function to create a new role
const createRole = async newRoleData => {
  const mutation = `
    mutation CreateRole($data: RoleCreateInput!) {
      createRole(data: $data) {
        id
        name
        description
        created_at
        updated_at
      }
    }
  `

  const variables = {
    data: {
      name: newRoleData.name,
      description: newRoleData.description,
      permissionIds: newRoleData.permissionIds,
    },
  }

  try {
    const token = getSelectedRoleToken()

    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    const result = await response.json()
    const createdRole = result.data.createRole

    // Add the new role to the list
    roles.value.push(createdRole)
    totalRoles.value = roles.value.length
  } catch (error) {
    console.error('Error creating role:', error)
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-role-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Role"
            density="compact"
            class="me-4"
          />
          <!-- <VBtn @click="isAddRoleDrawerOpen = true">
            Add New Role
          </VBtn> -->
        </div>
      </VCard>
    </div>

    <!-- Table to display roles -->
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
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex">
              <!-- <VBtn
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
              </VBtn> -->
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>

    <!-- AddRole Drawer Component -->
    <AddRole
      :is-drawer-open="isAddRoleDrawerOpen"
      @update:is-drawer-open="isAddRoleDrawerOpen = $event"
      @create-role="createRole"
    />
  </section>
</template>

