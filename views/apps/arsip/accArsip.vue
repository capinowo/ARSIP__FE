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
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content" :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate">
    <!-- Drawer Title -->
    <AppDrawerHeaderSection title="Add Master JRA" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- Classification Code -->
              <VCol cols="12">
                <VTextField v-model="classificationCode" :rules="[requiredValidator, classificationCodeValidator]"
                  label="Classification Code" placeholder="Enter classification code" />
              </VCol>

              <!-- Description -->
              <VCol cols="12">
                <VTextField v-model="description" :rules="[requiredValidator]" label="Description"
                  placeholder="Enter description" />
              </VCol>
              <!-- Retention Active -->
              <VCol cols="12">
                <VTextField v-model="retentionActive" type="number"
                  :rules="[requiredValidator, value => value >= 0 || 'Must be a positive number']"
                  label="Retention Active (in years)" placeholder="Enter number of years" />
              </VCol>
              <!-- Retention Inactive -->
              <VCol cols="12">
                <VTextField v-model="retentionInactive" type="number"
                  :rules="[requiredValidator, value => value >= 0 || 'Must be a positive number']"
                  label="Retention Inactive (in years)" placeholder="Enter number of years" />
              </VCol>
              <!-- Retention Disposition ID -->
              <VCol cols="12">
                <VSelect v-model="retentionDispositionId" :items="[
                  { title: 'Musnah', value: 1 },
                  { title: 'Permanen', value: 2 }
                ]" :rules="[requiredValidator]" label="Retention Disposition ID" placeholder="Select Disposition" />
              </VCol>

              <!-- Security Classification ID -->
              <VCol cols="12">
                <VSelect v-model="securityClassificationId" :items="[
                  { title: 'Terbuka', value: 1 },
                  { title: 'Terbatas', value: 2 }
                ]" :rules="[requiredValidator]" label="Security Classification ID"
                  placeholder="Select Classification" />
              </VCol>

              <!-- Submit and Cancel buttons -->
              <VCol cols="12">
                <VBtn type="submit" class="me-4">
                  Submit
                </VBtn>
                <VBtn type="reset" variant="outlined" color="error" @click="closeNavigationDrawer">
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>

  <section>
    <!-- Tampilkan loading saat data sedang diambil -->
    <div v-if="isLoading">Loading...</div>

    <!-- Tampilkan pesan error jika ada -->
    <div v-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>

    <!-- Tampilkan detail arsip setelah data berhasil diambil -->
    <div v-if="archiveDetail" class="mb-6">
      <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
        <div>
          <div class="d-flex gap-2 align-center mb-2 flex-wrap">
            <h5 class="text-h5">Detail Arsip #{{ archiveDetail.id }}</h5>
          </div>
          <div>
            <span class="text-body-1">{{ archiveDetail.updated_at || 'Tidak ada informasi' }}</span>
          </div>
        </div>
      </div>

      <!-- Menampilkan semua informasi arsip (kecuali ID) -->
      <VTabs v-model="activeTab">
        <VTab>Detail Arsip</VTab>
        <VTab>Dokumen</VTab>
      </VTabs>

      <VWindow v-model="activeTab">
        <VWindowItem>
          <VCard class="mb-6">
            <VCardText>
              <h5>ARSIP</h5>
              <hr class="mb-6">

              <v-row>
                <v-col md="12">
                  <v-text-field label="Judul Arsip" v-model="archiveData.judulArsip" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Deskripsi Arsip" v-model="archiveData.deskripsiArsip" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Unit" v-model="archiveData.unit" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Jenis Arsip" v-model="archiveData.jenisArsip" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Status Arsip" v-model="archiveData.statusArsip" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Dibuat pada" v-model="archiveData.dibuatPada" readonly />
                </v-col>
              </v-row>

              <h5>Klasifikasi</h5>
              <hr class="mb-6">

              <v-row>
                <v-col md="12">
                  <v-text-field label="Deskripsi klassifikasi" v-model="archiveData.deskripsiKlasifikasi" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Kode klasifikasi" v-model="archiveData.kodeKlasifikasi" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Retensi aktif" v-model="archiveData.retensiAktif" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Retensi non-aktif" v-model="archiveData.retensiNonAktif" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Jenis Retensi" v-model="archiveData.jenisRetensi" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Keamanan" v-model="archiveData.keamanan" readonly />
                </v-col>
              </v-row>

              <h5>Lokasi</h5>
              <hr class="mb-6">
              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama Gedung" v-model="archiveData.namaGedung" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama lokasi" v-model="archiveData.namaLokasi" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama ruangan" v-model="archiveData.namaRuangan" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama rak" v-model="archiveData.namaRak" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama box" v-model="archiveData.namaBox" readonly />
                </v-col>
              </v-row>

              <h5>Pengguna</h5>
              <hr class="mb-6">

              <v-row>
                <v-col md="12">
                  <v-text-field label="Nama pengguna" v-model="archiveData.namaPengguna" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Identitas pengguna" v-model="archiveData.identitasPengguna" readonly />
                </v-col>
              </v-row>

              <v-row>
                <v-col md="12">
                  <v-text-field label="Role pengguna" v-model="archiveData.rolePengguna" readonly />
                </v-col>
              </v-row>
            </VCardText>
          </VCard>
        </VWindowItem>

        <!-- TAB VIEW FILE UPLOAD -->
        <VWindowItem>
          <VCard class="mt-4">
            <VCardText>
              <p><strong>Dokumen Path:</strong> {{ archiveDetail.document_path }}</p>
              <VBtn v-if="archiveDetail.document_path" :href="archiveDetail.document_path" target="_blank"
                rel="noopener noreferrer" color="primary">
                Lihat Dokumen
              </VBtn>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </div>
  </section>
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
