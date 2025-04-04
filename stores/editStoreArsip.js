import { defineStore } from 'pinia'
import { onMounted, ref, watch } from 'vue'

export const useEditStore = defineStore('form', () => {
  // State untuk menyimpan data form
  const archiveId = ref(null) // ID Arsip yang akan diedit
  const selectedType = ref(null)
  const namaArsip = ref(null)
  const retentionActivePeriod = ref(null)
  const retentionInactivePeriod = ref(null)
  const retentionActiveDate = ref(null)
  const retentionInactiveDate = ref(null)
  const selectedUnit = ref(null)
  const selectedLocation = ref(null)
  const selectedClassification = ref(null)
  const selectedStatus = ref(null)
  const jumlahArsip = ref(null)
  const selectedMediaArsip = ref(null)
  const selectedTingkatPerkembangan = ref(null)
  const selectedKondisi = ref(null)
  const jumlahLampiran = ref(null)
  const selectedMediaLampiran = ref(null)
  const content = ref(null) // Untuk Deskripsi Arsip
  const tanggalDokumen = ref(null)
  const retentionDispositionName = ref(null)
  const nilaiGuna = ref(null)

  // Fungsi untuk mengambil data dari API GraphQL berdasarkan archiveId
  const fetchData = async () => {
    if (!archiveId.value) return // Jika ID belum ada, jangan fetch

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSelectedRoleToken()}`,
        },
        body: JSON.stringify({
          query: `
            query ($id: ID!) {
              getArchive(id: $id) { 
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
          `,
          variables: { id: archiveId.value },
        }),
      })

      const result = await response.json()
      if (result.data && result.data.getArchive) {
        const archive = result.data.getArchive
        selectedType.value = archive.archive_type_id
        namaArsip.value = archive.title
        retentionActivePeriod.value = archive.final_retensi_aktif
        retentionInactivePeriod.value = archive.final_retensi_inaktif
        selectedUnit.value = archive.unit_id
        selectedLocation.value = archive.location_id
        selectedClassification.value = archive.classification_id
        selectedStatus.value = archive.archive_status_id
        jumlahArsip.value = archive.jumlah_arsip
        selectedMediaArsip.value = archive.media_arsip
        selectedTingkatPerkembangan.value = archive.tingkat_perkembangan
        jumlahLampiran.value = archive.jumlah_lampiran
        selectedMediaLampiran.value = archive.media_lampiran
        content.value = archive.description
        tanggalDokumen.value = archive.created_at
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Fungsi untuk menyimpan data ke localStorage
  const saveDraft = () => {
    const draftData = {
      archiveId: archiveId.value,
      selectedType: selectedType.value,
      namaArsip: namaArsip.value,
      retentionActivePeriod: retentionActivePeriod.value,
      retentionInactivePeriod: retentionInactivePeriod.value,
      retentionActiveDate: retentionActiveDate.value,
      retentionInactiveDate: retentionInactiveDate.value,
      selectedUnit: selectedUnit.value,
      selectedLocation: selectedLocation.value,
      selectedClassification: selectedClassification.value,
      selectedStatus: selectedStatus.value,
      jumlahArsip: jumlahArsip.value,
      selectedMediaArsip: selectedMediaArsip.value,
      selectedTingkatPerkembangan: selectedTingkatPerkembangan.value,
      selectedKondisi: selectedKondisi.value,
      jumlahLampiran: jumlahLampiran.value,
      selectedMediaLampiran: selectedMediaLampiran.value,
      content: content.value,
      tanggalDokumen: tanggalDokumen.value,
      retentionDispositionName: retentionDispositionName.value,
      nilaiGuna: nilaiGuna.value,
    }

    localStorage.setItem('draftForm', JSON.stringify(draftData))
  }

  // Fungsi untuk memuat draft dari localStorage
  const loadDraft = () => {
    if (typeof window !== 'undefined') {
      const savedData = JSON.parse(localStorage.getItem('draftForm'))
      if (savedData) {
        archiveId.value = savedData.archiveId
        selectedType.value = savedData.selectedType
        namaArsip.value = savedData.namaArsip
        retentionActivePeriod.value = savedData.retentionActivePeriod
        retentionInactivePeriod.value = savedData.retentionInactivePeriod
        retentionActiveDate.value = savedData.retentionActiveDate
        retentionInactiveDate.value = savedData.retentionInactiveDate
        selectedUnit.value = savedData.selectedUnit
        selectedLocation.value = savedData.selectedLocation
        selectedClassification.value = savedData.selectedClassification
        selectedStatus.value = savedData.selectedStatus
        jumlahArsip.value = savedData.jumlahArsip
        selectedMediaArsip.value = savedData.selectedMediaArsip
        selectedTingkatPerkembangan.value = savedData.selectedTingkatPerkembangan
        selectedKondisi.value = savedData.selectedKondisi
        jumlahLampiran.value = savedData.jumlahLampiran
        selectedMediaLampiran.value = savedData.selectedMediaLampiran
        content.value = savedData.content
        tanggalDokumen.value = savedData.tanggalDokumen
        retentionDispositionName.value = savedData.retentionDispositionName
        nilaiGuna.value = savedData.nilaiGuna
      }
    }
  }

  // Muat draft dan fetch data saat komponen di-mount
  onMounted(() => {
    loadDraft()
    fetchData()
  })

  // Menggunakan watch untuk menyimpan perubahan otomatis
  watch(
    [
      archiveId, selectedType, namaArsip, retentionActivePeriod, retentionInactivePeriod,
      retentionActiveDate, retentionInactiveDate, selectedUnit, selectedLocation,
      selectedClassification, selectedStatus, jumlahArsip, selectedMediaArsip,
      selectedTingkatPerkembangan, selectedKondisi, jumlahLampiran, selectedMediaLampiran,
      content, tanggalDokumen, retentionDispositionName, nilaiGuna,
    ],
    saveDraft,
    { deep: true },
  )

  // Fungsi untuk menghapus draft
  const clearDraft = () => {
    localStorage.removeItem('draftForm')
    archiveId.value = null
    selectedType.value = null
    namaArsip.value = null
    retentionActivePeriod.value = null
    retentionInactivePeriod.value = null
    retentionActiveDate.value = null
    retentionInactiveDate.value = null
    selectedUnit.value = null
    selectedLocation.value = null
    selectedClassification.value = null
    selectedStatus.value = null
    jumlahArsip.value = null
    selectedMediaArsip.value = null
    selectedTingkatPerkembangan.value = null
    selectedKondisi.value = null
    jumlahLampiran.value = null
    selectedMediaLampiran.value = null
    content.value = null
    tanggalDokumen.value = null
    retentionDispositionName.value = null
    nilaiGuna.value = null
  }

  return {
    archiveId, selectedType, namaArsip, retentionActivePeriod, retentionInactivePeriod,
    retentionActiveDate, retentionInactiveDate, selectedUnit, selectedLocation,
    selectedClassification, selectedStatus, jumlahArsip, selectedMediaArsip,
    selectedTingkatPerkembangan, selectedKondisi, jumlahLampiran, selectedMediaLampiran,
    content, tanggalDokumen, retentionDispositionName, nilaiGuna,
    saveDraft, loadDraft, clearDraft,
  }
})
