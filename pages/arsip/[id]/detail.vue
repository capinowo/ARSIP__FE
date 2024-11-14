<script setup>
import { getSelectedRoleToken } from '@/middleware/auth.js';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  middleware: 'auth-middleware',
})

const route = useRoute();
const archiveId = route.params.id;
const archiveDetail = ref(null);
const isLoading = ref(false);
const errorMessage = ref(null);

// Fungsi untuk memformat tanggal
const formatDate = (dateStr) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', options); // Menggunakan 'id-ID' untuk format Indonesia
};


const fetchArchiveDetail = async () => {
  const query = `
    query GetArchive($getArchiveId: Int!) {
  getArchive(id: $getArchiveId) {
    user_id
    unit_id
    title
    location_id
    id
    document_path
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
  `;
  
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`, // Pastikan Anda mengganti ini dengan token yang sesuai
      },
      body: JSON.stringify({
        query,
        variables: { getArchiveId: parseInt(archiveId) },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      errorMessage.value = 'Error fetching archive data';
    } else if (result.data && result.data.getArchive) {
      archiveDetail.value = result.data.getArchive;
    } else {
      console.warn('No data returned from getArchive query:', result);
      errorMessage.value = 'No archive data found';
    }
  } catch (error) {
    console.error('Error fetching archive detail:', error);
    errorMessage.value = 'Error fetching archive detail';
  } finally {
    isLoading.value = false;
  }
};

// Fetch archive details saat komponen di-mount
onMounted(() => {
  fetchArchiveDetail();
});

// Dummy data untuk shipping activity
const shippingActivity = [
  { date: 'Aug 17, 2020', status: 'Shipped', location: 'Warehouse 1', image: 'https://via.placeholder.com/50' },
  { date: 'Aug 18, 2020', status: 'Out for Delivery', location: 'Courier Center', image: 'https://via.placeholder.com/50' },
  { date: 'Aug 19, 2020', status: 'Delivered', location: 'Customer Address', image: 'https://via.placeholder.com/50' },
];

// Dummy data untuk shipping address dan billing address
const shippingAddress = {
  name: 'John Doe',
  addressLine1: '45 Rocker Terrace',
  addressLine2: 'Latheronwheel',
  landmark: 'KW5 8NW, London',
  contact: '+1 (609) 972-22-22',
  country: 'USA',
  state: 'London',
  zipCode: '110001',
};

// Headers untuk tabel order detail
const headers = [
  { title: 'Product', key: 'productName' },
  { title: 'Price', key: 'price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Total', key: 'total', sortable: false },
];

// Headers untuk tabel shipping activity
const shippingHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Status', key: 'status' },
  { title: 'Location', key: 'location' },
  { title: 'Image', key: 'image' },
];

// Dialog visibility state
const isConfirmDialogVisible = ref(false);
</script>

<template>
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
      <VCard class="mb-6">
        <VCardText>
          <h5>ARSIP</h5>
          <hr class="mb-6">

          <p><strong>Judul:</strong> {{ archiveDetail.title }}</p>
          <p><strong>Deskripsi Arsip:</strong> {{ archiveDetail.description }}</p>
          <p><strong>Dokumen Path:</strong> {{ archiveDetail.document_path }}</p>
          <p><strong>Unit:</strong> {{ archiveDetail.unit?.name }}</p>
          <!-- <p><strong>Lokasi ID:</strong> {{ archiveDetail.location_id }}</p> -->
          <p><strong>Jenis Arsip:</strong> {{ archiveDetail.archiveType?.name }}</p>
          <p><strong>Status Arsip:</strong> {{ archiveDetail.archiveStatus?.name }}</p>
          <p><strong>Di buat pada:</strong> {{ formatDate(archiveDetail.created_at) }}</p>

          <!-- tolong kasih garis dan judul  -->
          <h5>Klasifikasi</h5>
          <hr class="mb-6">

          <!-- Menampilkan data dari classification -->
          <p><strong>Deskripsi Klasifikasi:</strong> {{ archiveDetail.classification?.description }}</p>
          <p><strong>Kode Klasifikasi:</strong> {{ archiveDetail.classification?.classification_code }}</p>
          <p><strong>Retensi Aktif:</strong> {{ archiveDetail.classification?.retention_active }} Tahun</p>
          <p><strong>Retensi Non-Aktif:</strong> {{ archiveDetail.classification?.retention_inactive }} Tahun</p>
          <p><strong>Jneis Retensi:</strong> {{ archiveDetail.classification?.retentionDisposition?.name }}</p>
          <p><strong>Keamanan:</strong> {{ archiveDetail.classification?.securityClassification?.name }}</p>

          <h5>Lokasi</h5>
          <hr class="mb-6">

          <!-- Menampilkan data dari lokasi -->
          <p><strong>Nama Gedung:</strong> {{ archiveDetail.location?.building_name }}</p>
          <p><strong>Nama Lokasi:</strong> {{ archiveDetail.location?.name }}</p>
          <p><strong>Nama Ruangan:</strong> {{ archiveDetail.location?.room_name }}</p>
          <p><strong>Nama Rak:</strong> {{ archiveDetail.location?.rack_name }}</p>
          <p><strong>Nama Box:</strong> {{ archiveDetail.location?.box_name }}</p>

          <h5>Pengguna</h5>
          <hr class="mb-6">

          <!-- Menampilkan data dari user -->
          <p><strong>Nama Pengguna:</strong> {{ archiveDetail.user?.name }}</p>
          <p><strong>Identitas Pengguna:</strong> {{ archiveDetail.user?.identity }}</p>
          <p><strong>Roles Pengguna:</strong> 
            <span v-for="role in archiveDetail.user?.roles" :key="role.id">{{ role.name }}</span>
          </p>
        </VCardText>
      </VCard>

      <!-- Konfirmasi Hapus Arsip -->
      <VDialog v-model="isConfirmDialogVisible" max-width="400px">
        <VCard>
          <VCardTitle>
            <span class="headline">Konfirmasi Hapus Arsip</span>
          </VCardTitle>
          <VCardActions>
            <VBtn text @click="isConfirmDialogVisible = false">Batal</VBtn>
            <VBtn color="error" @click="deleteArchive">Hapus</VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </section>
</template>




<style scoped>
/* Styling untuk berbagai elemen (opsional) */
</style>
