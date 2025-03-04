<script setup>
import useApprovalStatus from '@/composables/useApprovalStatus'
import useArsipStatus from '@/composables/useArsipStatus'
import useClassification from '@/composables/useClassification'
import { getSelectedRoleToken } from '@/middleware/auth'
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
const { fetchApprovalStatus } = useApprovalStatus()
const snackbarRef = ref(null)
const isDialogOpen = ref(false)
const archiveToMutate = ref(null)
const selectedFilter = ref('all')

const buttons = [
  { label: 'Semua', status: 'all' },
  { label: 'Usul Unggahan Arsip', status: 'active' },
  { label: 'Usul Pemberkasan Arsip', status: 'inactive' },
  { label: 'Usul Pemusnahan Arsip', status: 'destroyed' },
]

const openMutationDialog = item => {
  archiveToMutate.value = item  // Set the archive item to be deleted
  isDialogOpen.value = true     // Open the dialog
}

const closeDialog = () => {
  isDialogOpen.value = false   // Close the dialog
}

const confirmMutation = async () => {
  if (!archiveToMutate.value || !archiveToMutate.value.id) {
    console.warn('No archive selected for mutation:', archiveToMutate.value);
    return;
  }

  console.log("Mutating archive with ID:", archiveToMutate.value.id); // Debugging

  try {
    await mutateArchive(archiveToMutate.value.id);
  } catch (error) {
    console.error('Mutation failed:', error);
  } finally {
    closeDialog();
  }
};

const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Judul', key: 'title' },
  { title: 'Deskripsi', key: 'description' },
  { title: 'Klasifikasi', key: 'classification_description' },
  { title: 'Dokumen', key: 'documents' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchArchives = async (status = 'all') => {
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

  isLoading.value = true;
  try {
    const response = await fetch('http://localhost:4000/graphql', {
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
      archives.value = await Promise.all(
        result.data.getArchives.data.map(async archive => {
          const classification = await fetchClassification(archive.classification_id);
          const status = await fetchArsipStatus(archive.archive_status_id);
          const approvalStatus = await fetchApprovalStatus(archive.approval_status_id);

          return {
            ...archive,
            classification_description: classification?.description || 'N/A',
            archive_status_name: status?.name || 'N/A',
            approval_status_name: approvalStatus?.name || 'N/A',
          };
        })
      );
      totalArchives.value = result.data.getArchives.total || 0;
    } else {
      console.warn('No data returned from getArchives query:', result);
    }
  } catch (error) {
    console.error('Error fetching archives:', error);
    snackbarRef.value.showSnackbar('Error fetching archives', 'error');
  } finally {
    isLoading.value = false;
  }
};

const mutateArchive = async (id) => {
  const mutation = `
    mutation VerifyNewArchive($id: Int!) {
      verifyNewArchive(id: $id) {
        id
        description
        created_at
        updated_at
      }
    }
  `;

  const variables = { id };

  console.log("⏳ Mutating archive with ID:", id, "Type:", typeof id);
  console.log("🛂 Token:", getSelectedRoleToken());

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    console.log("📡 Server response status:", response.status);

    const result = await response.json();
    console.log("📥 GraphQL Response:", JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      throw new Error('Failed to mutate archive');
    }

    if (result.data && result.data.createArchiveMutation) {
      console.log(`✅ Archive with ID ${id} mutated successfully.`);
    } else {
      throw new Error('Mutation did not return expected data');
    }
  } catch (error) {
    console.error('🚨 Error mutating archive:', error);
    snackbarRef.value?.showSnackbar('Error mutating archive', 'error');
  } finally {
    isDialogOpen.value = false;
  }
};

const accArchive = item => {
  router.push(`/arsip/${item.id}/acc`)
}

const applyFilter = (status) => {
  selectedFilter.value = status;
  fetchArchives(status);
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
          <VTextField v-model="searchQuery" placeholder="Search Archive" density="compact" class="me-4" />
          <VBtn @click="router.push('/arsip/add')">Add New Arsip</VBtn>
        </div>
      </VCard>
    </div>
    <div class="d-flex justify-content-between mb-4">
      <VBtnToggle v-model="selectedFilter" class="d-flex w-100">
        <VBtn v-for="button in buttons" :key="button.status" @click="applyFilter(button.status)"
          class="flex-grow-1 text-center">
          {{ button.label }}
        </VBtn>
      </VBtnToggle>
    </div>
    <div>
      <VCard style="padding: 24px;">
        <VDataTable :headers="headers" :items="archives" :search="searchQuery" :loading="isLoading"
          :total-items="totalArchives" :items-per-page="itemsPerPage" :page="currentPage" item-key="id"
          @update:page="currentPage = $event" @update:items-per-page="itemsPerPage = $event">
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
              <VBtn icon style="margin-inline-end: 6px;" @click="accArchive(item)">
                <VIcon>ri-todo-line</VIcon>
              </VBtn>
              <VBtn icon @click="openMutationDialog(item)">
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </div>
    <VDialog v-model="isDialogOpen" max-width="400">
      <VCard>
        <VCardTitle>Confirm Approval</VCardTitle>
        <VCardText>Are you sure you want to approve this archive?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" @click="confirmMutation">Yes</VBtn>
          <VBtn @click="closeDialog">No</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>
