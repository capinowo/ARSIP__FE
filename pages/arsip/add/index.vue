<script setup>
import { useClassificationStore } from '@/stores/classificationStore';
import { useLocationStore } from '@/stores/locationStore';
import { useStatusStore } from '@/stores/statusStore';
import { useUnitStore } from '@/stores/unitStore';
import { computed, onMounted, ref } from 'vue';

const locationStore = useLocationStore();
const selectedLocation = ref(null);

// Mendapatkan options lokasi dari store
const locationOptions = computed(() => {
  return locationStore.locations.map(item => ({
    id: item.id,
    name: `${item.name} - ${item.building_name}`,  // Menampilkan nama dan building name
  }));
});

// Ambil data lokasi saat komponen di-mount
onMounted(() => {
  locationStore.fetchLocations(); // Memanggil fetchLocations untuk mengambil data
});

// Menggunakan store untuk mengambil unit
const unitStore = useUnitStore();
const selectedUnit = ref(null);

// Mendapatkan options unit dari store
const unitOptions = computed(() => {
  return unitStore.units.map(item => ({
    id: item.id,
    name: item.name,
  }));
});

// Ambil data unit saat komponen di-mount
onMounted(() => {
  unitStore.fetchUnits(); // Memanggil fetchUnits untuk mengambil data
});

const retentionPeriod = ref(null);
const currentDate = ref(''); // Variabel untuk menyimpan tanggal saat ini

onMounted(() => {
  const date = new Date();
  const options = { weekday: 'long', day: 'numeric', year: 'numeric', month: 'long' };
  currentDate.value = date.toLocaleDateString('id-ID', options); // Format dalam bahasa Indonesia
});

// Mengambil data dari classificationStore
const classificationStore = useClassificationStore();
onMounted(() => {
  classificationStore.fetchClassifications();
});

const selectedClassification = ref(null);

// Format options untuk klasifikasi
const classificationOptions = computed(() => {
  return classificationStore.classifications.map(item => ({
    text: `${item.classification_code} - ${item.description}`,  // Properti 'text' yang akan ditampilkan
    value: item.id,  // ID sebagai nilai
  }));
});

// Mengambil data dari statusStore
const statusStore = useStatusStore();
const selectedStatus = ref(null);

onMounted(() => {
  statusStore.fetchStatuses();
});

// Format options untuk status
const statusOptions = computed(() => {
  return statusStore.statuses.map(item => ({
    name: item.name,  // Properti 'name' yang akan ditampilkan
    id: item.id,      // ID sebagai nilai
  }));
});

// Konten deskripsi arsip
const content = ref(`<p>...</p>`);
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-center justify-md-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4">
          Input Arsip
        </h4>
        <span class="text-medium-emphasis">Tolong lengkapi dokumen arsip anda</span>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn
          variant="outlined"
          color="secondary"
        >
          Buang
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
        >
          Simpan Sebagai Draft
        </VBtn>
        <VBtn>Simpan Arsip</VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <!-- 👉 Product Information -->
        <VCard
          class="mb-6"
          title="Informasi Arsip"
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  label="Nama Arsip"
                  placeholder="Nama Arsip"
                />
              </VCol>
              <VCol cols="12">
                <VAutocomplete
                  label="Unit"
                  placeholder="Unit"
                  :items="unitOptions"
                  item-title="name"
                  item-value="id"
                  v-model="selectedUnit"
                />
              </VCol>
              <VCol cols="12">
                <VAutocomplete
                    label="Lokasi Arsip"
                    placeholder="Select Lokasi"
                    :items="locationOptions"
                    item-title="name"
                    item-value="id"
                    v-model="selectedLocation"
                  />
              </VCol>
              <VCol>
                <VLabel>
                  Deskripsi Arsip
                </VLabel>
                <ProductDescriptionEditor
                  v-model="content"
                  placeholder="Deskripsi Arsip"
                  class="border mt-1 rounded"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        md="4"
        cols="12"
      >
        <!-- 👉 Upload -->
        <VCard
          title="Upload Dokumen"
          class="mb-6"
        >
          <VCardText>
            <VFileInput
              show-size
              label="Upload Softcopy"
              prepend-icon="ri-camera-line"
              class="mb-4"
            />
            <VFileInput
              show-size
              label="Upload Lampiran"
              class="mb-4"
            />
          </VCardText>
        </VCard>

        <!-- 👉 Select Classification -->
        <VCard title="Arsip Berdasarkan">
          <VCardText>
            <div class="d-flex flex-column gap-y-4">
              <VAutocomplete
                label="Klasifikasi"
                placeholder="Select Klasifikasi"
                :items="classificationOptions"
                item-title="text" 
                item-value="value" 
                v-model="selectedClassification"
              />
              <VSelect
                label="Select Status"
                v-model="selectedStatus"
                :items="statusOptions"
                item-title="name"  
                item-value="id"   
                placeholder="Select Status"
              />
              <VTextField
                label="Tanggal Arsip Masuk"
                prepend-icon="ri-calendar-schedule-line"
                :placeholder="currentDate" 
                readonly
              />
              <VTextField
                label="Periode Retensi"
                prepend-icon="ri-calendar-schedule-line"
                placeholder="Masukkan jumlah tahun"
                v-model="retentionPeriod"
                type="number"
                min="1"
                suffix="Tahun" 
              />
            </div>
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
