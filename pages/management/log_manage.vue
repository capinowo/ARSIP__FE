<script setup>
import { getSelectedRoleToken } from '@/middleware/auth';
import { onMounted, ref } from 'vue';

// const isAddRoleDrawerOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalLogs = ref(0);

const archiveLogs = ref([]);
const isArchiveLoading = ref(false);

// Table headers
const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Archive ID', key: 'archive_id' },
    { title: 'User ID', key: 'user_id' },
    { title: 'Status', key: 'activity_status_id' },
    { title: 'Description', key: 'description' },
    { title: 'Created At', key: 'created_at' }
]

const fetchArchiveLogs = async () => {
  const query = `
    query GetArchiveLogs {
      getArchiveLogs {
        total
        data {
          id
          archive_id
          user_id
          activity_status_id
          description
          created_at
          updated_at
        }
      }
    }
  `;

  isArchiveLoading.value = true;
  try {
    const token = getSelectedRoleToken();
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    console.log("GraphQL Response:", result); // Debugging

    if (result.data && result.data.getArchiveLogs) {
      archiveLogs.value = result.data.getArchiveLogs.data; // Simpan data logs
      totalLogs.value = result.data.getArchiveLogs.total;  // Simpan total logs
    } else {
      console.error("GraphQL Query Error:", result.errors);
    }
  } catch (error) {
    console.error("Error fetching archive logs:", error);
  } finally {
    isArchiveLoading.value = false;
  }
};


onMounted(() => {
  fetchArchiveLogs()
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
            placeholder="Search Logs"
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
            :items="archiveLogs" 
            :search="searchQuery"
            :loading="isArchiveLoading"
            :total-items="totalLogs"
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
    <!-- <AddRole
      :is-drawer-open="isAddRoleDrawerOpen"
      @update:is-drawer-open="isAddRoleDrawerOpen = $event"
      @create-role="createRole"
    /> -->
  </section>
</template>

