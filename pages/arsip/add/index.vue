<!-- eslint-disable camelcase -->
<!-- eslint-disable camelcase -->
<script setup>
import { useClassificationStore } from '@/stores/classificationStore'
import { useFormStore } from '@/stores/formStoreArsip'
import { useLocationStore } from '@/stores/locationStore'
import { useRetentionDispositionStore } from '@/stores/retentionDispositionStore'
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
  { name: 'Dokumen' },
  { name: 'Audio' },
  { name: 'Video' },
  { name: 'Elektronik' },
  { name: 'Tekstual' },
])

const nilaiGunaOptions = computed(() => [
  { name: 'Administrasi' },
  { name: 'Hukum' },
  { name: 'Keuangan' },
  { name: 'IPTEK' },
  { name: 'Lainnya' },
])

const tingkatPerkembanganOptions = computed(() => {
  if (formStore.selectedMedia === 'Dokumen' || formStore.selectedMedia === 'Tekstual') {
    return [
      { name: 'Asli' },
      { name: 'Tembusan' },
      { name: 'Salinan / Ganda' },
      { name: 'Fotocopy' },
      { name: 'Pertinggal' },
    ]
  } else if (formStore.selectedMedia === 'Audio' || formStore.selectedMedia === 'Video' || formStore.selectedMedia === 'Elektronik') {
    return [
      { name: 'Baik' },
      { name: 'Rusak' },
    ]
  }
  return []
})

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
const createdDate = ref('')

onMounted(() => {
  const date = new Date()
  createdDate.value = date.toISOString().substr(0, 10) // Format YYYY-MM-DD agar cocok dengan input type="date"
})

const classificationStore = useClassificationStore()

const classificationOptions = computed(() => {
  return classificationStore.classifications.map(item => ({
    value: item.id, // id sebagai value
    text: `${item.classification_code} - ${item.description}` // Gunakan properti yang benar
  }))
})

onMounted(() => {
  classificationStore.fetchClassifications().then(() => {
    // console.log('Fetched classifications:', classificationStore.classifications) 
  })
})

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

const retentionDispositionStore = useRetentionDispositionStore()

// Ambil retentionDispositionName berdasarkan selectedClassification
const retentionDispositionName = computed(() => {
  if (!formStore.selectedClassification) return ''

  // Cari classification yang dipilih
  const selectedClass = classificationStore.classifications.find(
    c => c.id === formStore.selectedClassification
  )

  if (!selectedClass) return ''

  // Ambil retention_disposition_id
  const dispositionId = selectedClass.retention_disposition_id
  if (!dispositionId) return ''

  // Cari retention disposition berdasarkan ID
  const retention = retentionDispositionStore.retentions.find(r => r.id === dispositionId)

  return retention ? retention.name : 'Unknown'
})

// Gunakan watchEffect agar formStore.retentionDispositionName selalu update
watchEffect(() => {
  formStore.retentionDispositionName = retentionDispositionName.value
})

onMounted(async () => {
  await classificationStore.fetchClassifications()
  await retentionDispositionStore.fetchRetentions()
})


const formatDate = (date) => {
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const retentionActiveDate = computed(() => {
  if (formStore.selectedClassification && formStore.tanggalDokumen) {
    const selectedClass = classificationStore.classifications.find(c => c.id === formStore.selectedClassification);
    if (selectedClass) {
      const activeYears = selectedClass.retention_active || 0;
      const documentDate = new Date(formStore.tanggalDokumen);
      documentDate.setFullYear(documentDate.getFullYear() + activeYears);
      return formatDate(documentDate);
    }
  }
  return '';
});

const retentionInactiveDate = computed(() => {
  if (formStore.selectedClassification && retentionActiveDate.value) {
    const selectedClass = classificationStore.classifications.find(c => c.id === formStore.selectedClassification);
    if (selectedClass) {
      const inactiveYears = selectedClass.retention_inactive || 0;
      const activeDate = new Date(retentionActiveDate.value.split('/').reverse().join('-')); // Konversi balik ke format Date
      activeDate.setFullYear(activeDate.getFullYear() + inactiveYears);
      return formatDate(activeDate);
    }
  }
  return '';
});



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

const statusComputed = computed(() => {
  if (!formStore.tanggalDokumen || !retentionActiveDate.value || !retentionInactiveDate.value) {
    return null // Jika tanggal belum lengkap, status tetap kosong
  }

  // Konversi retentionActiveDate dan retentionInactiveDate ke format Date
  const [dayA, monthA, yearA] = retentionActiveDate.value.split('/').map(Number)
  const activeDate = new Date(yearA, monthA - 1, dayA)

  const [dayI, monthI, yearI] = retentionInactiveDate.value.split('/').map(Number)
  const inactiveDate = new Date(yearI, monthI - 1, dayI)

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalisasi waktu ke tengah malam agar akurat

  let statusName = ''

  if (today < activeDate) {
    statusName = 'Aktif'  // Masih dalam masa aktif
  } else if (today >= activeDate && today < inactiveDate) {
    statusName = 'Inaktif'  // Sudah inaktif, belum musnah
  } else {
    statusName = 'Statis'  // Sudah melewati retensi inaktif
  }

  // Cari ID status berdasarkan nama status
  const matchedStatus = statusStore.statuses.find(status => status.name === statusName)
  return matchedStatus ? matchedStatus.id : null
})



watchEffect(() => {
  formStore.selectedStatus = statusComputed.value
  console.log('Updated Selected Status:', formStore.selectedStatus) // Debugging
})


console.log('Status Options:', statusOptions)
console.log('Selected Status:', formStore.selectedStatus)

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
  if (!formStore.namaArsip) {
    showSnackbar('Harap lengkapi semua field yang wajib!', 'error');
    return;
  }

  try {
    const data = {
      title: formStore.namaArsip,
      description: formStore.content,
      classification_id: formStore.selectedClassification,
      archive_status_id: formStore.selectedStatus,
      archive_type_id: formStore.selectedType,
      unit_id: formStore.selectedUnit,
      location_id: formStore.selectedLocation,
      user_id: 1,
      approval_status_id: 2,
      jumlah_arsip: parseInt(formStore.jumlahArsip, 10) || 0,
      media_arsip: formStore.selectedMediaArsip,
      document_date: formStore.tanggalDokumen
        ? new Date(formStore.tanggalDokumen).toISOString()
        : null,
      final_retensi_aktif: retentionActiveDate.value
        ? new Date(retentionActiveDate.value).toISOString()
        : null,
      final_retensi_inaktif: retentionInactiveDate.value
        ? new Date(retentionInactiveDate.value).toISOString()
        : null,
    };

    const savedArchive = await saveArsip(data);
    if (savedArchive.error) {
      showSnackbar(savedArchive.error, 'error');
      return;
    }

    showSnackbar('Arsip berhasil disimpan!', 'success');

    if (savedArchive?.id && selectedFile.value) {
      await uploadFileArchive(savedArchive.id, selectedFile.value);
      showSnackbar('File berhasil diunggah!', 'success');
    }

    clearDraft();
    setTimeout(() => {
      navigateTo('/arsip/list_arsip');
    }, 2000);
  } catch (error) {
    showSnackbar(error.message || 'Terjadi kesalahan saat menyimpan arsip', 'error');
  }
};

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
  <VSnackbar v-model="snackbar.show" :color="snackbar.color" top :timeout="2000" multi-line>
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
        <VCard class="mb-6 pb-4" title="Form Arsip">
          <VCardText>
            <VRow>

              <VCol cols="12">
                <VTextField v-model="formStore.tanggalDokumen" label="Tanggal Arsip Dibuat"
                  prepend-icon="ri-calendar-schedule-line" type="date" />
              </VCol>
              <VCol cols="12">
                <VAutocomplete v-model="formStore.selectedClassification" label="Klasifikasi"
                  placeholder="Select Klasifikasi" :items="classificationOptions" item-title="text" item-value="value"
                  :rules="[value => !!value || 'Klasifikasi wajib dipilih']" />
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
                <VTextField v-model="unit_name" label="Unit" placeholder="Unit" readonly />
                <input v-model="unit_id" type="hidden">
              </VCol>
              <VCol cols="6">
                <VTextField v-model="selectedLocationName" label="Lokasi" placeholder="Lokasi" readonly />
                <input v-model="formStore.selectedLocation" type="hidden">
              </VCol>
              <VCol cols="12">
                <VTextField v-model="formStore.namaArsip" label="Judul Arsip" placeholder="Judul Arsip"
                  :rules="[value => !!value || 'Judul Arsip wajib diisi']" />
              </VCol>
              <VCol cols="12">
                <VTextarea v-model="formStore.content" label="Deskripsi Arsip" placeholder="Deskripsi Arsip"
                  :rules="[value => !!value || 'Deskripsi Arsip wajib diisi']" />
              </VCol>

              <VCol cols="12">
                <VSelect v-model="formStore.selectedNilaiGuna" label="Nilai Guna" :items="nilaiGunaOptions"
                  item-title="name" item-value="name" placeholder="Select Nilai Guna"
                  :rules="[value => !!value || 'Nilai Guna wajib dipilih']" />
              </VCol>



              <VCol cols="3">
                <VTextField v-model="formStore.retentionActivePeriod" label="Retensi Aktif (belum)"
                  placeholder="Masukkan jumlah tahun" :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number" min="1" suffix="Tahun" />
              </VCol>
              <VCol cols="3">
                <VTextField v-model="formStore.retentionActiveDate" label="Tenggat Retensi Aktif" readonly />
              </VCol>

              <VCol cols="3">
                <VTextField v-model="formStore.retentionInactivePeriod" label="Retensi Inaktif (belum)"
                  placeholder="Masukkan jumlah tahun" :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number" min="1" suffix="Tahun" />
              </VCol>
              <VCol cols="3">
                <VTextField v-model="formStore.retentionInactiveDate" label="Tenggat Retensi Inaktif"
                  prepend-icon="ri-calendar-schedule-line" readonly />
              </VCol>

              <VCol cols="6">
                <VSelect v-model="formStore.selectedStatus" label="Status" :items="statusOptions" item-title="name"
                  item-value="id" placeholder="Select Status" readonly />
              </VCol>

              <VCol cols="6">
                <VTextField v-model="formStore.retentionDispositionName" label="Jenis Retensi"
                  prepend-icon="ri-calendar-schedule-line" placeholder="Jenis Retensi akan terisi otomatis" readonly />
              </VCol>

              <VCol cols="4">
                <VTextField v-model="formStore.jumlahArsip" label="Jumlah Arsip (belum)"
                  placeholder="Masukkan jumlah tahun" :rules="[value => !!value || 'Periode Retensi wajib diisi']"
                  type="number" min="1" />
              </VCol>
              <VCol cols="4">
                <VSelect v-model="formStore.selectedMedia" label="Pilih Media" :items="mediaOptions" item-title="name"
                  item-value="name" placeholder="Select Media" :rules="[value => !!value || 'Media wajib dipilih']" />
              </VCol>
              <VCol cols="4" v-if="formStore.selectedMedia === 'Dokumen' || formStore.selectedMedia === 'Tekstual'">
                <VSelect v-model="formStore.selectedTingkatPerkembangan" label="Tingkat Perkembangan (Dokumen/Tekstual)"
                  :items="tingkatPerkembanganOptions" item-title="name" item-value="name"
                  placeholder="Select Tingkat Perkembangan"
                  :rules="[value => !!value || 'Tingkat Perkembangan wajib dipilih']" />
              </VCol>

              <VCol cols="4"
                v-if="formStore.selectedMedia === 'Audio' || formStore.selectedMedia === 'Video' || formStore.selectedMedia === 'Elektronik'">
                <VSelect v-model="formStore.selectedTingkatPerkembangan"
                  label="Tingkat Perkembangan (Audio/Video/Elektronik)" :items="tingkatPerkembanganOptions"
                  item-title="name" item-value="name" placeholder="Select Tingkat Perkembangan"
                  :rules="[value => !!value || 'Tingkat Perkembangan wajib dipilih']" />
              </VCol>


              <VCol cols="12">
                <VFileInput v-model="selectedFile" show-size label="Upload Arsip" class="mb-4"
                  @change="handleFileChange" />
              </VCol>
            </VRow>
          </VCardText>

          <!-- Tombol Simpan dan Clear Draft di bagian bawah -->
          <VCardActions class="d-flex justify-end mt-4 px-4 pb-4">
            <VBtn variant="outlined" color="secondary" @click="clearDraft">
              Clear Draft
            </VBtn>
            <VBtn variant="flat" color="primary" style="margin-inline-start: 8px;" @click="handleSave">
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
