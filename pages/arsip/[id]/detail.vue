<script setup>
import { getSelectedRoleToken } from '@/middleware/auth'
import { BASE_URL } from "@/utils/api"
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// Middleware
definePageMeta({
  middleware: 'auth-middleware',
})

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

const fetchArchiveDetail = async () => {
  const query = `
    query GetArchive($getArchiveId: Int!) {
      getArchive(id: $getArchiveId) {
        id title description document_path created_at
        archiveType { name }
        archiveStatus { name }
        classification {
          description classification_code retention_active retention_inactive
          retentionDisposition { name }
          securityClassification { name }
        }
        location {
          name room_name rack_name box_name building_name
        }
        user { name identity roles { name } }
        unit { name }
      }
    }
  `

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSelectedRoleToken()}`,
      },
      body: JSON.stringify({ query, variables: { getArchiveId: parseInt(archiveId) } }),
    })

    const result = await response.json()

    archiveDetail.value = result.data?.getArchive || null
  } catch (error) {
    errorMessage.value = 'Error fetching archive detail'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchArchiveDetail()
})
</script>

<template>
  <section>
    <div v-if="isLoading">
      Loading...
    </div>
    <div
      v-if="errorMessage"
      class="text-red-500"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="archiveDetail"
      class="mb-6"
    >
      <!--
        <h5 class="text-h5">
        Detail Arsip #{{ archiveDetail.id }}
        </h5> 
      -->
      <!-- <p>{{ archiveDetail.updated_at || 'Tidak ada informasi' }}</p> -->

      <VTabs v-model="activeTab">
        <VTab>Detail</VTab>
        <VTab>File</VTab>
      </VTabs>

      <VWindow v-model="activeTab">
        <!-- TAB DETAIL -->
        <VWindowItem>
          <VCard class="mt-4">
            <VCardText>
              <!-- <h5>ARSIP</h5> -->
              <!-- <hr class="mb-6"> -->
              <div class="info-grid">
                <div class="mb-4">
                  <strong>Judul:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.title }}
                </div>
                <div class="mb-4">
                  <strong>Deskripsi:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.description }}
                </div>
                <div class="mb-4">
                  <strong>Unit:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.unit?.name }}
                </div>
                <div class="mb-4">
                  <strong>Jenis Arsip:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.archiveType?.name }}
                </div>
                <div class="mb-4">
                  <strong>Status Arsip:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.archiveStatus?.name }}
                </div>
                <div class="mb-4">
                  <strong>Dibuat Pada:</strong>
                </div> <div class="mb-4">
                  {{ formatDate(archiveDetail.created_at) }}
                </div>
              </div>

              <!-- <h5>Klasifikasi</h5> -->
              <!-- <hr class="mb-6"> -->
              <div class="info-grid">
                <div class="mb-4">
                  <strong>Deskripsi Klasifikasi:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.description }}
                </div>
                <div class="mb-4">
                  <strong>Kode Klasifikasi:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.classification_code }}
                </div>
                <div class="mb-4">
                  <strong>Retensi Aktif:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.retention_active }} Tahun
                </div>
                <div class="mb-4">
                  <strong>Retensi Non-Aktif:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.retention_inactive }} Tahun
                </div>
                <div class="mb-4">
                  <strong>Jenis Retensi:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.retentionDisposition?.name }}
                </div>
                <div class="mb-4">
                  <strong>Keamanan:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.classification?.securityClassification?.name }}
                </div>
              </div>

              <!-- <h5>Lokasi</h5> -->
              <!-- <hr class="mb-6"> -->
              <div class="info-grid">
                <div class="mb-4">
                  <strong>Nama Gedung:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.location?.building_name }}
                </div>
                <div class="mb-4">
                  <strong>Nama Lokasi:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.location?.name }}
                </div>
                <div class="mb-4">
                  <strong>Nama Ruangan:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.location?.room_name }}
                </div>
                <div class="mb-4">
                  <strong>Nama Rak:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.location?.rack_name }}
                </div>
                <div class="mb-4">
                  <strong>Nama Box:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.location?.box_name }}
                </div>
              </div>

              <!-- <h5>Pengguna</h5> -->
              <!-- <hr class="mb-6"> -->
              <div class="info-grid">
                <div class="mb-4">
                  <strong>Nama Pengguna:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.user?.name }}
                </div>
                <div class="mb-4">
                  <strong>Identitas:</strong>
                </div> <div class="mb-4">
                  {{ archiveDetail.user?.identity }}
                </div>
                <!--
                  <div class="mb-1"><strong>Roles:</strong></div> 
                  <div class="mb-1">
                  <span
                  v-for="role in archiveDetail.user?.roles"
                  :key="role.name"
                  >{{ role.name }}</span>
                  </div> 
                -->
              </div>
            </VCardText>
          </VCard>
        </VWindowItem>

        <!-- TAB VIEW FILE UPLOAD -->
        <VWindowItem>
          <VCard class="mt-4">
            <VCardText>
              <!-- <h5>View File Upload</h5> -->
              <!-- <hr class="mb-6"> -->
              <p><strong>Dokumen Path:</strong> {{ archiveDetail.document_path }}</p>
              <VBtn
                v-if="archiveDetail.document_path"
                :href="archiveDetail.document_path"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
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
  align-items: center; /* Agar kontennya sejajar */
  gap: 8px 16px; /* Jarak antar kolom */
  grid-template-columns: 200px auto; /* Kolom pertama untuk label, kedua untuk value */ /* Jarak antar baris */
}

.info-grid strong {
  display: block;
  text-align: end;
}
</style>

