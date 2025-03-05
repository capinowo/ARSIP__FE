<!-- eslint-disable camelcase -->
<script setup>
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
const snackbarRef = ref(null)
const isDialogOpen = ref(false)



const closeDialog = () => {
  isDialogOpen.value = false   // Close the dialog
}

const selectedArchives = ref([]);


// Configure table headers
const headers = [
  { title: 'No', key: 'no', sortable: false },
  { title: 'Judul', key: 'title' },
  { title: 'Deskripsi', key: 'description' },
  { title: 'Klasifikasi', key: 'classification_description' },
  { title: 'Dokumen', key: 'documents' },
  { title: 'Actions', key: 'actions', sortable: false },
  { title: '', key: 'select', sortable: false },
]

// GraphQL query to fetch archives data
const fetchArchives = async () => {
  const query = `
    query {
      getArchives (where: { archive_status_id: 4, approval_status_id: 2 }) {
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

  isLoading.value = true
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query }),
    })

    const result = await response.json()

    if (result.errors) {
      console.log('📥 Raw Response:', await response.text())
      console.error('GraphQL errors:', result.errors)
    } else if (result.data && result.data.getArchives) {
      // Map archives and fetch classification description
      archives.value = await Promise.all(
        result.data.getArchives.data.map(async archive => {
          const classification = await fetchClassification(archive.classification_id)
          const status = await fetchArsipStatus(archive.archive_status_id)

          return {
            ...archive,
            classification_description: classification?.description || 'N/A',
            archive_status_name: status?.name || 'N/A',  // Set status name here
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

// Function to mutate the archive
const mutateArchive = async (id) => {
  const mutation = `
    mutation CreateArchiveMutation($data: ArchiveMutationCreateInput!) {
      createArchiveMutation(data: $data) {
        id
        archive_id
        created_at
        updated_at
      }
    }
  `;

  const variables = {
    data: {
      archive_id: id,  // ✅ Pastikan struktur ini sesuai dengan schema di backend
    }
  };

  console.log("⏳ Mutating archive with ID:", id, "Type:", typeof id);
  console.log("🛂 Token:", getSelectedRoleToken());

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
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
    isDialogOpen.value = false; // Tutup dialog setelah operasi selesai
  }
};


const detailArchive = item => {
  router.push(`/arsip/${item.id}/detail`) // Mengarahkan ke halaman detail dengan ID dinamis
}

const submitProposal = () => {
  if (selectedArchives.value.length === 0) {
    console.warn("No archives selected.");
    return;
  }

  // Navigasi ke halaman detail_usul_musnah dengan parameter ID yang dipilih
  router.push({
    path: "/arsip/verifikasi/detail_usul_musnah",
    query: { ids: selectedArchives.value.join(",") }
  });
};



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
        <VDataTable :headers="headers" :items="archives" :search="searchQuery" :loading="isLoading"
          :total-items="totalArchives" :items-per-page="itemsPerPage" :page="currentPage" item-key="id"
          @update:page="currentPage = $event" @update:items-per-page="itemsPerPage = $event">
          <!-- Checkbox Column -->
          <template #item.select="{ item }">
            <VCheckbox v-model="selectedArchives" :value="item.id" density="compact"></VCheckbox>
          </template>

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
              <VBtn icon style="margin-inline-end: 6px;" @click="detailArchive(item)">
                <VIcon>ri-todo-line</VIcon>
              </VBtn>
              <VBtn icon @click="openMutationDialog(item)">
                <VIcon>ri-delete-bin-2-fill</VIcon>
              </VBtn>
            </div>
          </template>
        </VDataTable>

        <VCardActions class="justify-end">
          <VBtn color="primary" :disabled="selectedArchives.length === 0" @click="submitProposal">
            Kirim Usulan
          </VBtn>

        </VCardActions>


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
