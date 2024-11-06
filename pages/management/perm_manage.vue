<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import { onMounted, ref } from 'vue';

// const isAddPermissionDrawerOpen = ref(false);
const searchQuery = ref('');
const permissions = ref([]);
const isLoading = ref(false);
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Table headers for permissions
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  // Uncomment if needed
  // { title: 'Updated At', key: 'updated_at' },
  // { title: 'Actions', key: 'actions', sortable: false },
];

// Fetch permissions data
const fetchPermissions = async () => {
  const query = `
    query GetPermissions {
      getPermissions {
        data {
          id
          name
          description
          created_at
          updated_at
        }
      }
    }
  `;

  isLoading.value = true;
  try {
    const token = getSelectedRoleToken();

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    // Ensure data is received and structured correctly
    if (result.data && result.data.getPermissions) {
      permissions.value = result.data.getPermissions.data;
      // totalPermissions.value = result.data.getPermissions.total;
    } else {
      console.error('Error fetching permissions: Invalid response structure', result);
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPermissions();
});
</script>

<template>
  <section>
    <!-- Main page content -->
    <div class="mb-6">
      <VCard style="padding: 24px;">
        <div class="app-permission-search-filter d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search Permission"
            density="compact"
            class="me-4"
          />
          <!-- Uncomment if adding new permission functionality is added -->
          <!-- <VBtn @click="isAddPermissionDrawerOpen = true">
            Add New Permission
          </VBtn> -->
        </div>
      </VCard>
    </div>

    <!-- Table to display permissions -->
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="permissions"
          :search="searchQuery"
          :loading="isLoading"
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
              <!-- Uncomment if editing/deleting functionality is needed -->
              <!-- <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="editPermission(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn>
              <VBtn
                icon
                @click="deletePermission(item)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn> -->
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>

    <!-- AddPermission Drawer Component -->
    <!-- <AddPermission
      :is-drawer-open="isAddPermissionDrawerOpen"
      @update:is-drawer-open="isAddPermissionDrawerOpen = $event"
    /> -->
  </section>
</template>
