<!-- eslint-disable camelcase -->
<!-- eslint-disable vue/custom-event-name-casing -->
<script setup>
import { getSelectedRoleToken } from '@/middleware/auth'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

// Middleware
definePageMeta({
  middleware: 'auth-middleware',
})

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'create-classification',
])

const isFormValid = ref(false)
const refForm = ref()
const classificationCode = ref('')
const description = ref('')
const retentionActive = ref(1) // Default to 1 (Yes)
const retentionInactive = ref(1) // Default to 1 (Yes)
const retentionDispositionId = ref(1) // Default to 1 (Musnah)
const securityClassificationId = ref(1) // Default to 1 (Terbuka)

// Custom validation rule for classification code
// const classificationCodeValidator = value => {
//   if (!value) {
//     return 'Classification code is required'
//   }

//   return value.length === 6 || 'Classification code must be exactly 6 characters'
// }

// Required field validator
const requiredValidator = value => {
  return !!value || 'This field is required'
}

// Close drawer function
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

// Form submission
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('create-classification', {
        classification_code: classificationCode.value,
        description: description.value,
        retention_active: parseInt(retentionActive.value, 10),
        retention_inactive: parseInt(retentionInactive.value, 10),
        retention_disposition_id: parseInt(retentionDispositionId.value, 10),
        security_classification_id: parseInt(securityClassificationId.value, 10),
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

// Update drawer visibility
const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

// Archive detail fetching logic
const route = useRoute()
const archiveId = route.params.id
const archiveDetail = ref(null)
const isLoading = ref(false)
const errorMessage = ref(null)
const activeTab = ref(0) // Tab Navigation

const formatDate = dateStr => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString('id-ID', options)
}

const archiveData = computed(() => ({
  judulArsip: archiveDetail.value?.title || '',
  deskripsiArsip: archiveDetail.value?.description || '',
  dokumenPath: archiveDetail.value?.document_path || '',
  unit: archiveDetail.value?.unit?.name || '',
  jenisArsip: archiveDetail.value?.archiveType?.name || '',
  statusArsip: archiveDetail.value?.archiveStatus?.name || '',
  dibuatPada: formatDate(archiveDetail.value?.created_at),
  deskripsiKlasifikasi: archiveDetail.value?.classification?.description || '',
  kodeKlasifikasi: archiveDetail.value?.classification?.classification_code || '',
  retensiAktif: archiveDetail.value?.classification?.retention_active || '',
  retensiNonAktif: archiveDetail.value?.classification?.retention_inactive || '',
  keamanan: archiveDetail.value?.classification?.securityClassification?.name || '',
  namaGedung: archiveDetail.value?.location?.building_name || '',
  namaLokasi: archiveDetail.value?.location?.name || '',
  namaRuangan: archiveDetail.value?.location?.room_name || '',
  namaRak: archiveDetail.value?.location?.rack_name || '',
  namaBox: archiveDetail.value?.location?.box_name || '',
  namaPengguna: archiveDetail.value?.user?.name || '',
  identitasPengguna: archiveDetail.value?.user?.identity || '',
  rolePengguna: archiveDetail.value?.user?.roles?.map(role => role.name).join(', ') || '',
}))

const fetchArchiveDetail = async () => {
  const query = `
    query GetArchive($getArchiveId: Int!) {
      getArchive(id: $getArchiveId) {
        user_id
        unit_id
        title
        location_id
        id
        description
        classification_id
        archive_type_id
        archive_status_id
        archiveType {
          id
          name
        }
        archiveStatus {
          id
          name
        }
        classification {
          id
          description
          classification_code
          retentionDisposition {
            id
            name
          }
          retention_active
          retention_disposition_id
          retention_inactive
          securityClassification {
            id
            name
          }
          security_classification_id
        }
        location {
          id
          name
          rack_name
          room_name
          unit_id
          description
          building_name
          box_name
        }
        user {
          name
          identity
          roles {
            id
            name
          }
        }
        unit {
          id
          name
        }
        created_at
      }
    }
  `

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`, // Pastikan Anda mengganti ini dengan token yang sesuai
      },
      body: JSON.stringify({
        query,
        variables: { getArchiveId: parseInt(archiveId) },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      errorMessage.value = 'Error fetching archive data'
    } else if (result.data && result.data.getArchive) {
      archiveDetail.value = result.data.getArchive
    } else {
      console.warn('No data returned from getArchive query:', result)
      errorMessage.value = 'No archive data found'
    }
  } catch (error) {
    console.error('Error fetching archive detail:', error)
    errorMessage.value = 'Error fetching archive detail'
  } finally {
    isLoading.value = false
  }
}

// Fetch archive details saat komponen di-mount
onMounted(() => {
  fetchArchiveDetail()
})
</script>

<template>
  <section>
    <!-- === BAGIAN VIEW DETAIL ARSIP === -->
    <div v-if="isLoading">Loading...</div>

    <div v-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>

    <div v-if="archiveDetail">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h5 class="text-h5">Detail Arsip #{{ archiveDetail.id }}</h5>
          <div class="text-caption text-medium-emphasis">{{ archiveDetail.updated_at || 'Tidak ada informasi' }}</div>
        </div>

        <VBtn @click="isEditDrawerOpen = true" color="primary">
          Edit Arsip
        </VBtn>
      </div>

      <!-- TABS -->
      <VTabs v-model="activeTab">
        <VTab>Detail Arsip</VTab>
        <VTab>Dokumen</VTab>
      </VTabs>

      <VWindow v-model="activeTab">
        <!-- Tab 1: Detail -->
        <VWindowItem>
          <VCard class="mt-4">
            <VCardText>
              <h5>Informasi Arsip</h5>
              <v-row>
                <v-col md="6">
                  <v-text-field label="Judul Arsip" :model-value="archiveDetail.judul_arsip" readonly />
                </v-col>
                <v-col md="6">
                  <v-text-field label="Deskripsi" :model-value="archiveDetail.deskripsi" readonly />
                </v-col>
              </v-row>

              <h5 class="mt-6">Lokasi</h5>
              <v-row>
                <v-col md="6">
                  <v-text-field label="Gedung" :model-value="archiveDetail.gedung" readonly />
                </v-col>
                <v-col md="6">
                  <v-text-field label="Ruangan" :model-value="archiveDetail.ruangan" readonly />
                </v-col>
              </v-row>

              <h5 class="mt-6">Lainnya</h5>
              <v-row>
                <v-col md="6">
                  <v-text-field label="Status" :model-value="archiveDetail.status" readonly />
                </v-col>
                <v-col md="6">
                  <v-text-field label="Unit" :model-value="archiveDetail.unit" readonly />
                </v-col>
              </v-row>
            </VCardText>
          </VCard>
        </VWindowItem>

        <!-- Tab 2: Dokumen -->
        <VWindowItem>
          <VCard class="mt-4">
            <VCardText>
              <p><strong>Dokumen Path:</strong> {{ archiveDetail.document_path }}</p>
              <VBtn v-if="archiveDetail.document_path" :href="archiveDetail.document_path" target="_blank"
                color="primary">
                Lihat Dokumen
              </VBtn>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </div>
  </section>

  <!-- === DRAWER: EDIT ARSIP === -->
  <VNavigationDrawer temporary location="end" :width="400" v-model="isEditDrawerOpen" class="scrollable-content">
    <AppDrawerHeaderSection title="Edit Arsip" @cancel="isEditDrawerOpen = false" />
    <VDivider />

    <PerfectScrollbar>
      <VCard flat>
        <VCardText>
          <VForm ref="form" v-model="isFormValid" @submit.prevent="onSubmitEdit">
            <VRow>
              <VCol cols="12">
                <VTextField v-model="editData.judulArsip" label="Judul Arsip" :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="editData.deskripsi" label="Deskripsi" :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <VSelect v-model="editData.status" :items="['Aktif', 'Inaktif']" label="Status Arsip"
                  :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <VBtn type="submit" color="primary" class="me-2">Simpan</VBtn>
                <VBtn color="error" variant="outlined" @click="isEditDrawerOpen = false">Batal</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>




<style scoped>
.info-grid {
  display: grid;
  align-items: center;
  /* Agar kontennya sejajar */
  gap: 8px 16px;
  /* Jarak antar kolom */
  grid-template-columns: 200px auto;
  /* Kolom pertama untuk label, kedua untuk value */
  /* Jarak antar baris */
}

.info-grid strong {
  display: block;
  text-align: end;
}
</style>
