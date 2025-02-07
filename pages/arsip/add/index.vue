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

const retentionPeriod = ref(null)
const currentDate = ref('')

onMounted(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', year: 'numeric', month: 'long' }

  currentDate.value = date.toLocaleDateString('id-ID', options)
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
      formStore.retentionPeriod = selectedClass.retention_active

      // You can add other retention/security values to formStore here if needed
    }
  }
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
    archive_status_id: formStore.selectedStatus,
    archive_type_id: formStore.selectedType,
    classification_id: formStore.selectedClassification,
    description: formStore.content,
    document_path: "", // Initialize with empty string
    location_id: formStore.selectedLocation,
    title: formStore.namaArsip,
    unit_id: formStore.selectedUnit,
    user_id: 1,
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
              <VCol cols="6">
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
             
              <VCol cols="6">
                <VSelect
                  v-model="formStore.selectedStatus"
                  label="Select Status"
                  :items="statusOptions" 
                  item-title="name"
                  item-value="id"
                  placeholder="Select Status" 
                  :rules="[value => !!value || 'Status wajib dipilih']"
                />
              </VCol>
              <VCol cols="6">
                <VSelect
                  v-model="formStore.selectedType"
                  label="Select Type"
                  :items="typeOptions" 
                  item-title="name"
                  item-value="id"
                  placeholder="Select Type" 
                  :rules="[value => !!value || 'Type wajib dipilih']"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  label="Tanggal Arsip Dibuat"
                  prepend-icon="ri-calendar-schedule-line" 
                  :placeholder="currentDate"
                  readonly
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="formStore.retentionPeriod"
                  label="Periode Retensi" 
                  prepend-icon="ri-calendar-schedule-line"
                  placeholder="Masukkan jumlah tahun" 
                  :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number"
                  min="1"
                  suffix="Tahun"
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
