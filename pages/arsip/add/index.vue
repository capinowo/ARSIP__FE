<!-- eslint-disable camelcase -->
<!-- eslint-disable camelcase -->
<script setup>
import { useClassificationStore } from '@/stores/classificationStore'
import { useFormStore } from '@/stores/formStoreArsip'
import { useLocationStore } from '@/stores/locationStore'
import { saveArsip } from '@/stores/saveArsip'
import { uploadFileArchive } from '@/stores/saveFileUploads'
import { useStatusStore } from '@/stores/statusStore'
import { useTokenStore } from '@/stores/tokenStores'
import { useUnitStore } from '@/stores/unitStore'
import { computed, onMounted, ref, watch } from 'vue'

definePageMeta({
  middleware: 'auth-middleware',
})

const route = useRoute()
const locationStore = useLocationStore()
const selectedLocation = ref(null)
const formStore = useFormStore()
const content = ref(null)
const selectedFile = ref(null)
const tokenStore = useTokenStore()
const unit_id = ref(null)
const unit_name = ref(null)

onMounted(() => {
  const selectedUnit = tokenStore.tokenData.selectedUnit
  if (selectedUnit) {
    unit_id.value = selectedUnit.id
    unit_name.value = selectedUnit.name
    formStore.selectedUnit = selectedUnit.id
  }
})

const unitStore = useUnitStore()

onMounted(() => {
  unitStore.fetchUnits()
})

const handleFileChange = event => {
  if (event && event.length > 0) {
    selectedFile.value = event[0]
  }
}

const typeOptions = computed(() => [
  { id: 1, name: 'Substantif' },
  { id: 2, name: 'Fasilitatif' },
])

const mediaOptions = computed(() => [
  { name: 'Berkas' },
  { name: 'Buku' },
])

const tingkatPerkembanganOptions = computed(() => [
  { name: 'Lampiran' },
  { name: 'Pertinggal' },
])

const clearDraft = () => {
  formStore.clearDraft()
}

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const locationOptions = computed(() => {
  return locationStore.locations
    .filter(item => item.unit_id === unit_id.value)
    .map(item => ({
      id: item.id,
      name: `${item.name} - ${item.building_name}`,
    }))
})

console.log(locationStore.locations.name)

onMounted(() => {
  locationStore.fetchLocations().then(() => {
    console.log(locationStore.locations)
  })
})

const retentionActivePeriod = ref(null)
const retentionInactivePeriod = ref(null)
const currentDate = ref('')

onMounted(() => {
  const date = new Date()
  currentDate.value = date.toISOString().substr(0, 10) // Format YYYY-MM-DD agar cocok dengan input type="date"
})

const classificationStore = useClassificationStore()

const classificationOptions = computed(() => {
  // console.log('Classifications:', classificationStore.classifications) 
  
  return classificationStore.classifications.map(item => {
    // console.log('Mapping item:', {
    //   classification_code: item.classification_code,
    //   description: item.description,
    //   retention_active: item.retention_active,
    //   retention_inactive: item.retention_inactive,
    // }) 
    
    return {
      text: `${item.classification_code} - ${item.description}`,
      value: item.id,
      retention_active: item.retention_active || 'N/A',
      retention_inactive: item.retention_inactive || 'N/A',
     
    }
  })
})

onMounted(() => {
  classificationStore.fetchClassifications().then(() => {
    // console.log('Fetched classifications:', classificationStore.classifications) 
  })
})

// Add watcher to update retention values when classification changes
watch(() => formStore.selectedClassification, newVal => {
  if (newVal) {
    const selectedClass = classificationStore.classifications.find(c => c.id === newVal)
    if (selectedClass) {
      formStore.retentionActivePeriod = selectedClass.retention_active
      formStore.retentionInactivePeriod = selectedClass.retention_inactive

      // You can add other retention/security values to formStore here if needed
    }
  }
})

const retentionActiveDate = computed(() => {
  if (formStore.selectedClassification && currentDate.value) {
    const selectedClass = classificationStore.classifications.find(c => c.id === formStore.selectedClassification)
    if (selectedClass) {
      const activeYears = selectedClass.retention_active || 0
      const publishDate = new Date(formStore.publishDate || currentDate.value)
      publishDate.setFullYear(publishDate.getFullYear() + activeYears)
      return publishDate.toISOString().substr(0, 10) // Format YYYY-MM-DD
    }
  }
  return ''
})

const retentionInactiveDate = computed(() => {
  if (formStore.selectedClassification && retentionActiveDate.value) {
    const selectedClass = classificationStore.classifications.find(c => c.id === formStore.selectedClassification)
    if (selectedClass) {
      const inactiveYears = selectedClass.retention_inactive || 0
      const activeEndDate = new Date(retentionActiveDate.value)
      activeEndDate.setFullYear(activeEndDate.getFullYear() + inactiveYears)
      return activeEndDate.toISOString().substr(0, 10) // Format YYYY-MM-DD
    }
  }
  return ''
})

// Pastikan formStore menyimpan tanggal publikasi arsip
watch(() => formStore.selectedClassification, () => {
  formStore.retentionActiveDate = retentionActiveDate.value
  formStore.retentionInactiveDate = retentionInactiveDate.value
})

const statusStore = useStatusStore()
const selectedStatus = ref(null)

onMounted(() => {
  statusStore.fetchStatuses()
})

const statusOptions = computed(() => {
  return statusStore.statuses.map(item => ({
    name: item.name,
    id: item.id,
  }))
})

const selectedLocationName = computed(() => {
  const location = locationStore.locations.find(item => item.unit_id === unit_id.value)
  
  return location ? `${location.name} - ${location.building_name}` : ''
})

watch(() => unit_id.value, newVal => {
  const location = locationStore.locations.find(item => item.unit_id === newVal)
  if (location) {
    formStore.selectedLocation = location.id
  }
})

const handleSave = async () => {
  if (!formStore.namaArsip || !formStore.selectedUnit || !formStore.selectedLocation || !formStore.selectedClassification || !formStore.selectedStatus) {
    formStore.isFormValid = false
    
    return
  }

  formStore.isFormValid = true

  const data = {
    title: formStore.namaArsip,
    description: formStore.content,
    classification_id: formStore.selectedClassification,
    document_path: "", // Jika ada file, sesuaikan dengan path dari file yang diunggah
    archive_status_id: formStore.selectedStatus,
    archive_type_id: formStore.selectedType,
    unit_id: formStore.selectedUnit,
    location_id: formStore.selectedLocation,
    user_id: 1, // Sesuaikan dengan ID user yang sedang login
    approval_status_id: 2,
    jumlah_arsip: parseInt(formStore.jumlahArsip, 10) || 0, // Jika tidak diisi, default ke 0
    media_arsip: formStore.selectedMediaArsip,
    tingkat_perkembangan: formStore.selectedTingkatPerkembangan,
    jumlah_lampiran: parseInt(formStore.jumlahArsip, 10) || 0, // Jika tidak diisi, default ke 0
    media_lampiran: formStore.selectedMediaLampiran,
    document_date: new Date().toISOString(),
    final_retensi_aktif: new Date().toISOString(),
    final_retensi_inaktif: new Date().toISOString(),
  }

  try {
    const savedArchive = await saveArsip(data)

    if (savedArchive.error) {
      showSnackbar(savedArchive.error, 'error')
      
      return
    }

    showSnackbar('Save Arsip berhasil!', 'success')

    if (savedArchive?.id && selectedFile.value) {
      const uploadedFile = await uploadFileArchive(savedArchive.id, selectedFile.value)

      // Update the document_path of the saved archive
      savedArchive.document_path = uploadedFile.document_path

      showSnackbar('File berhasil diunggah!', 'success')
    }

    clearDraft()
    setTimeout(() => {
      navigateTo('/arsip/list_arsip')
    }, 2000)
  } catch (error) {
    const errorMessages = error.message || 'Terjadi kesalahan saat menyimpan arsip'

    showSnackbar(errorMessages, 'error')
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
  setTimeout(() => {
    snackbar.value.show = false
  }, 2000)
}
</script>


<template>
  <!-- Snackbar Notification -->
  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    top
    :timeout="2000"
    multi-line
  >
    {{ snackbar.message }}
  </VSnackbar>
  
  <div>
    <div class="d-flex flex-wrap justify-center justify-md-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4">
          Input Arsip
        </h4>
        <span class="text-medium-emphasis">Tolong lengkapi dokumen arsip anda</span>
      </div>
    </div>

    <VRow>
      <VCol md="12">
        <!-- Menggabungkan semua bagian dalam satu card -->
        <VCard
          class="mb-6 pb-4"
          title="Form Arsip"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VAutocomplete
                  v-model="formStore.selectedClassification"
                  label="Klasifikasi"
                  placeholder="Select Klasifikasi" 
                  :items="classificationOptions"
                  item-title="text"
                  item-value="value" 
                  :rules="[value => !!value || 'Klasifikasi wajib dipilih']"
                />
              </VCol>
             
              <!--
                <VCol cols="6">
                <VAutocomplete
                v-model="formStore.selectedUnit"
                label="Unit"
                placeholder="Unit" 
                :items="unitOptions"
                item-title="name"
                item-value="id" 
                :rules="[value => !!value || 'Unit wajib dipilih']"
                />
                </VCol> 
              -->
              <VCol cols="6">
                <VTextField
                  v-model="unit_name"
                  label="Unit"
                  placeholder="Unit"
                  readonly
                />
                <input
                  v-model="unit_id"
                  type="hidden"
                >
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="selectedLocationName"
                  label="Lokasi"
                  placeholder="Lokasi"
                  readonly
                />
                <input
                  v-model="formStore.selectedLocation"
                  type="hidden"
                >
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="formStore.namaArsip"
                  label="Judul Arsip"
                  placeholder="Judul Arsip" 
                  :rules="[value => !!value || 'Judul Arsip wajib diisi']"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="formStore.content"
                  label="Deskripsi Arsip"
                  placeholder="Deskripsi Arsip" 
                  :rules="[value => !!value || 'Deskripsi Arsip wajib diisi']"
                />
              </VCol>
             
              <VCol cols="12">
                <VTextField
                  v-model="currentDate"
                  label="Tanggal Arsip Dibuat"
                  prepend-icon="ri-calendar-schedule-line" 
                  type="date"
                />
              </VCol>
              

              <VCol cols="3">
                <VTextField 
                  v-model="formStore.retentionActivePeriod"
                  label="Retensi Aktif (belum)" 
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                  suffix="Tahun"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="formStore.retentionActiveDate"
                  label="Tenggat Retensi Aktif" 
                  prepend-icon="ri-calendar-schedule-line"
                  readonly
                />
              </VCol>

              <VCol cols="3">
                <VTextField 
                  v-model="formStore.retentionInactivePeriod"
                  label="Retensi Inaktif (belum)" 
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                  suffix="Tahun"
                />
              </VCol>
              <VCol cols="3">
                <VTextField 
                  v-model="formStore.retentionInactiveDate"
                  label="Tenggat Retensi Inaktif" 
                  prepend-icon="ri-calendar-schedule-line"
                  readonly

                />
              </VCol>

              <VCol cols="6">
                <VSelect
                  v-model="formStore.selectedStatus"
                  label="Status (belum)"
                  :items="statusOptions" 
                  item-title="name"
                  item-value="id"
                  placeholder="Select Status" 
                  :rules="[value => !!value || 'Status wajib dipilih']"
                />
              </VCol>

              <VCol cols="6">
                <VTextField 
                  v-model="formStore.retentionActivePeriod"
                  label="Jenis Retensi (belum)" 
                  prepend-icon="ri-calendar-schedule-line"
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                  suffix="Tahun"
                />
              </VCol>

              <VCol cols="4">
                <VTextField 
                  v-model="formStore.jumlahArsip"
                  label="Jumlah Arsip (belum)" 
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="formStore.selectedMediaArsip"
                  label="Media (belum)"
                  :items="mediaOptions" 
                  item-title="name"
                  item-value="name"
                  placeholder="Select Media" 
                  :rules="[value => !!value || 'Media wajib dipilih']"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="formStore.selectedTingkatPerkembangan"
                  label="Tingkat Perkembangan (belum)"
                  :items="tingkatPerkembanganOptions" 
                  item-title="name"
                  item-value="name"
                  placeholder="Select Tingkat Perkembangan" 
                  :rules="[value => !!value || 'Tingkat Perkembangan wajib dipilih']"
                />
              </VCol>
              
              <VCol cols="12">
                <VFileInput
                  v-model="selectedFile"
                  show-size
                  label="Upload Arsip"
                  class="mb-4"
                  @change="handleFileChange"
                />
              </VCol>

              <VCol cols="4">
                <VTextField 
                  v-model="formStore.jumlahLampiran"
                  label="Jumlah Lampiran (belum)" 
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="formStore.selectedMediaLampiran"
                  label="Media Lampiran (belum)"
                  :items="mediaOptions" 
                  item-title="name"
                  item-value="name"
                  placeholder="Select Media" 
                  :rules="[value => !!value || 'Media wajib dipilih']"
                />
              </VCol>

              <VCol cols="12">
                <VFileInput
                  v-model="selectedFile"
                  show-size
                  label="Upload Lampiran"
                  class="mb-4"
                  @change="handleFileChange"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- Tombol Simpan dan Clear Draft di bagian bawah -->
          <VCardActions class="d-flex justify-end mt-4 px-4 pb-4">
            <VBtn
              variant="outlined"
              color="secondary"
              @click="clearDraft"
            >
              Clear Draft
            </VBtn>
            <VBtn
              variant="flat"
              color="primary"
              style="margin-inline-start: 8px;"
              @click="handleSave"
            >
              Simpan Arsip
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>


<style lang="scss" scoped>
  .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 6px;
  }
</style>

<style lang="scss">
.inventory-card {
  .v-radio-group,
  .v-checkbox {
    .v-selection-control {
      align-items: start !important;
    }

    .v-label.custom-input {
      border: none !important;
    }
  }
}

.ProseMirror {
  p {
    margin-block-end: 0;
  }

  padding: 0.5rem;
  outline: none;

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>
