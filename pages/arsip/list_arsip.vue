<script setup>
import useArsipStatus from '@/composables/useArsipStatus.js';
import useClassification from '@/composables/useClassification.js';
import { getSelectedRoleToken } from '@/middleware/auth.js';
import AddListArsip from '@/views/apps/list-arsip/AddListArsip.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Middleware for auth on the page
definePageMeta({
  middleware: 'auth-middleware',
})

const router = useRouter()
const isAddListArsipVisible = ref(false)
const searchQuery = ref('')
const archives = ref([])
const isLoading = ref(false)
const totalArchives = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const { fetchClassification } = useClassification()
const { fetchArsipStatus } = useArsipStatus();

// Configure table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Judul', key: 'title' },
  { title: 'Deskripsi', key: 'description' },
  { title: 'Klasifikasi', key: 'classification_description' },
  { title: 'Document Path', key: 'document_path' },
  { title: 'Status', key: 'archive_status_name' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// GraphQL query to fetch archives data
const fetchArchives = async () => {
  const query = `
    query {
      getArchives {
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
          created_at
          updated_at
        }
      }
    }
  `;

  isLoading.value = true;
  try {
    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    } else if (result.data && result.data.getArchives) {
      // Map archives and fetch classification description
      archives.value = await Promise.all(
        result.data.getArchives.data.map(async (archive) => {
          const classification = await fetchClassification(archive.classification_id);
          const status = await fetchArsipStatus(archive.archive_status_id);
          // console.log(`Classification fetched for ID ${archive.classification_id}:`, classification); // Debugging line
          return {
            ...archive,
            classification_description: classification?.description || 'N/A',
            archive_status_name: status?.name || 'N/A',  // Set status name here
          };
        })
      );
      totalArchives.value = result.data.getArchives.total || 0;
    } else {
      console.warn('No data returned from getArchives query:', result);
    }
  } catch (error) {
    console.error('Error fetching archives:', error);
  } finally {
    isLoading.value = false;
  }
};



// Placeholder functions for edit and delete buttons
// const editArchive = item => {
//   console.log('Edit archive:', item)
// }

const deleteArchive = item => {
  console.log('Delete archive:', item)
}

const detailArchive = item => {
  console.log('Detail archive:', item)
}

onMounted(() => {
  fetchArchives()
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
            placeholder="Search Archive"
            density="compact"
            class="me-4"
          />
          <!-- Add New Archive Button -->
          <VBtn @click="isAddListArsipVisible = true">
            Add New Arsip
          </VBtn>
        </div>
      </VCard>
    </div>
    <div>
      <VCard style="padding: 24px;">
        <VDataTable
          :headers="headers"
          :items="archives"
          :search="searchQuery"
          :loading="isLoading"
          :total-items="totalArchives"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-key="id"
          @update:page="currentPage = $event"
          @update:items-per-page="itemsPerPage = $event"
        >
          <!-- Slot for No column -->
          <template #item.no="{ index }">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </template>

          <!-- Slot for Classification Description column -->
          <template #item.classification_description="{ item }">
            {{ item.classification_description }}
          </template>

          <template #item.archive_status_name="{ item }">
            {{ item.archive_status_name }}
          </template>

          <!-- Slot for Actions column -->
          <template #item.actions="{ item }">
            <div class="d-flex">
              <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="detailArchive(item)"
              >
              <VIcon>ri-todo-line</VIcon>
              </VBtn>
              <!-- <VBtn
                icon
                style="margin-inline-end: 6px;"
                @click="editArchive(item)"
              >
                <VIcon>ri-edit-2-fill</VIcon>
              </VBtn> -->
              <VBtn
                icon
                @click="deleteArchive(item)"
              >
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>
    <!-- Drawer for adding new archive -->
    <AddListArsip v-model:isDrawerOpen="isAddListArsipVisible" />
  </section>
</template>

