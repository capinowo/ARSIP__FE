<!-- eslint-disable camelcase -->
<script setup>
import { useClassificationStore } from '@/stores/classificationStore'
import { useFormStore } from '@/stores/formStoreArsip'
import { useLocationStore } from '@/stores/locationStore'
import { saveArsip } from '@/stores/saveArsip'
import { useStatusStore } from '@/stores/statusStore'
import { useUnitStore } from '@/stores/unitStore'
import { computed, onMounted, ref } from 'vue'

definePageMeta({
  middleware: 'auth-middleware',
})

const route = useRoute()
const locationStore = useLocationStore()
const selectedLocation = ref(null)
const formStore = useFormStore()
const content = ref(null)


const typeOptions = computed(() => [
  { id: 1, name: 'Subtantif' },
  { id: 2, name: 'Fasilitatif' },
])

const clearDraft = () => {
  formStore.clearDraft()
}

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',  // Set warna snackbar (success/error)
})

// Mendapatkan options lokasi dari store
const locationOptions = computed(() => {
  return locationStore.locations.map(item => ({
    id: item.id,
    name: `${item.name} - ${item.building_name}`,  // Menampilkan nama dan building name
  }))
})

// Ambil data lokasi saat komponen di-mount
onMounted(() => {
  locationStore.fetchLocations() // Memanggil fetchLocations untuk mengambil data
})

// Menggunakan store untuk mengambil unit
const unitStore = useUnitStore()
const selectedUnit = ref(null)

// Mendapatkan options unit dari store
const unitOptions = computed(() => {
  return unitStore.units.map(item => ({
    id: item.id,
    name: item.name,
  }))
})

// Ambil data unit saat komponen di-mount
onMounted(() => {
  unitStore.fetchUnits() // Memanggil fetchUnits untuk mengambil data
})

const retentionPeriod = ref(null)
const currentDate = ref('') // Variabel untuk menyimpan tanggal saat ini

onMounted(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', year: 'numeric', month: 'long' }

  currentDate.value = date.toLocaleDateString('id-ID', options) // Format dalam bahasa Indonesia
})

// Mengambil data dari classificationStore
const classificationStore = useClassificationStore()

onMounted(() => {
  classificationStore.fetchClassifications()
})

const selectedClassification = ref(null)

// Format options untuk klasifikasi
const classificationOptions = computed(() => {
  return classificationStore.classifications.map(item => ({
    text: `${item.classification_code} - ${item.description}`,  // Properti 'text' yang akan ditampilkan
    value: item.id,  // ID sebagai nilai
  }))
})

// Mengambil data dari statusStore
const statusStore = useStatusStore()
const selectedStatus = ref(null)

onMounted(() => {
  statusStore.fetchStatuses()
})

// Format options untuk status
const statusOptions = computed(() => {
  return statusStore.statuses.map(item => ({
    name: item.name,  // Properti 'name' yang akan ditampilkan
    id: item.id,      // ID sebagai nilai
  }))
})

const handleSave = async () => { // Tambahkan `async` di sini
  // Validasi form sebelum menyimpan
  if (!formStore.namaArsip || !formStore.selectedUnit || !formStore.selectedLocation || !formStore.selectedClassification || !formStore.selectedStatus) {
    formStore.isFormValid = false
    
    return
  }

  formStore.isFormValid = true

  const data = {
    // eslint-disable-next-line camelcase
    archive_status_id: formStore.selectedStatus,
    archive_type_id: formStore.selectedType,
    classification_id: formStore.selectedClassification,
    description: formStore.content,
    document_path: "path/to/document", // Ganti dengan path yang sesuai
    location_id: formStore.selectedLocation,
    title: formStore.namaArsip,
    unit_id: formStore.selectedUnit,
    user_id: 1, // Ganti dengan user ID yang sesuai
  }

  try {
    await saveArsip(data)
    clearDraft()
    showSnackbar('Save Arsip berhasil!', 'success')
    setTimeout(() => {
      navigateTo('/arsip/list_arsip')
    }, 2000)
  } catch (error) {
  // Ambil semua pesan error dari backend GraphQL
    const errorMessages = error.map(err => err.message).join(', ') 
    || 'Terjadi kesalahan saat menyimpan arsip'
  
    showSnackbar(errorMessages, 'error')
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
  setTimeout(() => {
    snackbar.value.show = false
  }, 2000) // Snackbar akan hilang setelah 3 detik
}

// Konten deskripsi arsip
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

      <div class="d-flex gap-4 align-center flex-wrap">
        <!--
          <VBtn
          variant="outlined"
          color="secondary"
          >
          Buang
          </VBtn> 
        -->
        <VBtn
          variant="outlined"
          color="primary"
          @click="clearDraft"
        >
          Clear Draft
        </VBtn>
        <VBtn
          color="primary"
          @click="handleSave"
        >
          Simpan Arsip
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="12">
        <!-- Menjadikan 3 kartu dalam satu kolom -->
        <!-- Informasi Arsip -->
        <VCard
          class="mb-6"
          title="Informasi Arsip"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formStore.namaArsip"
                  label="Nama Arsip"
                  placeholder="Nama Arsip"
                  :rules="[value => !!value || 'Nama Arsip wajib diisi']"
                />
              </VCol>
              <VCol cols="12">
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
              <VCol cols="12">
                <VAutocomplete
                  v-model="formStore.selectedLocation"
                  label="Lokasi Arsip"
                  placeholder="Select Lokasi"
                  :items="locationOptions"
                  item-title="name"
                  item-value="id"
                  :rules="[value => !!value || 'Lokasi Arsip wajib dipilih']"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="formStore.content"
                  label="Deskripsi Arsip"
                  placeholder="Deskripsi Arsip"
                  :rules="[value => !!value || 'Deskripsi Arsip wajib diisi']"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Arsip Berdasarkan -->
        <VCard
          class="mb-6"
          title="Arsip Berdasarkan"
        >
          <VCardText>
            <div class="d-flex flex-column gap-y-4">
              <VAutocomplete
                v-model="formStore.selectedClassification"
                label="Klasifikasi"
                placeholder="Select Klasifikasi"
                :items="classificationOptions" 
                item-title="text" 
                item-value="value"
                :rules="[value => !!value || 'Klasifikasi wajib dipilih']"
              />
              <VSelect
                v-model="formStore.selectedStatus"
                label="Select Status"
                :items="statusOptions"  
                item-title="name"   
                item-value="id"
                placeholder="Select Status"
                :rules="[value => !!value || 'Status wajib dipilih']"
              />
              <VSelect
                v-model="formStore.selectedType"
                label="Select Type"
                :items="typeOptions"
                item-title="name"
                item-value="id"
                placeholder="Select Type"
                :rules="[value => !!value || 'Type wajib dipilih']"
              />
              <VTextField
                label="Tanggal Arsip Masuk"
                prepend-icon="ri-calendar-schedule-line"
                :placeholder="currentDate" 
                readonly
              />
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
            </div>
          </VCardText>
        </VCard>

        <!-- Upload Dokumen -->
        <VCard
          title="Upload Dokumen"
          class="mb-6"
        >
          <VCardText>
            <!--
              <VFileInput
              show-size
              label="Upload Softcopy"
              prepend-icon="ri-camera-line"
              class="mb-4"
              /> 
            -->
            <VFileInput
              show-size
              label="Upload Lampiran"
              class="mb-4"
            />
          </VCardText>
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
